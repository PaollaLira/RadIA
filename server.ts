import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Configure a chave no painel Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return {
    mimeType: match[1],
    data: match[2],
  };
}

const PRIMARY_CLINICAL_MODEL = "gemini-4-hydrogen";
const FALLBACK_FAST_MODEL = "gemini-3.1-flash-lite";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatusCode(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const anyErr = err as Record<string, unknown>;
  if (typeof anyErr.status === "number") return anyErr.status;
  if (typeof anyErr.code === "number") return anyErr.code;
  if (typeof anyErr.message === "string") {
    try {
      const parsed = JSON.parse(anyErr.message);
      const nestedCode = parsed?.error?.code;
      if (typeof nestedCode === "number") return nestedCode;
    } catch {
      // ignore non-JSON messages
    }
    if (/\b503\b|UNAVAILABLE|high demand|overloaded/i.test(anyErr.message)) {
      return 503;
    }
    if (/\b429\b|RESOURCE_EXHAUSTED|rate limit|quota/i.test(anyErr.message)) {
      return 429;
    }
    if (/\b403\b|PERMISSION_DENIED|API_KEY_INVALID/i.test(anyErr.message)) {
      return 403;
    }
  }
  return undefined;
}

function isRetryableGeminiError(err: unknown): boolean {
  const code = getErrorStatusCode(err);
  if (code === 503 || code === 502 || code === 504 || code === 429) {
    return true;
  }
  const msg = err instanceof Error ? err.message : String(err || "");
  return /UNAVAILABLE|high demand|overloaded|temporarily|ETIMEDOUT|ECONNRESET|fetch failed|503|429/i.test(
    msg
  );
}

function formatFriendlyGeminiError(
  err: unknown,
  language?: "pt" | "en"
): { statusCode: number; message: string } {
  const isEnglish = language === "en";
  const code = getErrorStatusCode(err);
  const rawMsg = err instanceof Error ? err.message : String(err || "");

  if (
    code === 503 ||
    /UNAVAILABLE|high demand|overloaded/i.test(rawMsg)
  ) {
    return {
      statusCode: 503,
      message: isEnglish
        ? "The AI service is temporarily experiencing high demand. Please wait a few seconds and try again."
        : "O serviço de IA está temporariamente com alta demanda. Aguarde alguns segundos e tente novamente.",
    };
  }

  if (
    code === 429 ||
    /RESOURCE_EXHAUSTED|quota|rate limit/i.test(rawMsg)
  ) {
    return {
      statusCode: 429,
      message: isEnglish
        ? "API request limit temporarily reached. Please wait a moment and try again, or check your key in Settings > Secrets."
        : "Limite temporário de requisições da API atingido. Aguarde um momento e tente novamente, ou verifique sua chave em Settings > Secrets.",
    };
  }

  if (
    code === 403 ||
    /PERMISSION_DENIED|API_KEY_INVALID|API key not valid/i.test(rawMsg)
  ) {
    return {
      statusCode: 403,
      message: isEnglish
        ? "Gemini API key is invalid or lacks permission. Please verify it in Settings > Secrets."
        : "Chave da API Gemini inválida ou sem permissão. Verifique a configuração em Settings > Secrets.",
    };
  }

  // Strip raw JSON wrapper if present
  let cleanMessage = rawMsg;
  try {
    const parsed = JSON.parse(rawMsg);
    if (typeof parsed?.error?.message === "string") {
      cleanMessage = parsed.error.message;
    }
  } catch {
    // keep rawMsg
  }

  return {
    statusCode: 500,
    message:
      cleanMessage ||
      (isEnglish
        ? "Failed to process clinical analysis with AI. Please try again."
        : "Falha ao processar a análise clínica com a IA. Tente novamente."),
  };
}

async function generateWithRetryAndFallback(params: {
  ai: GoogleGenAI;
  primaryModel: string;
  fallbackModel?: string;
  contents: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"];
  config?: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["config"];
  fallbackConfig?: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["config"];
}) {
  const { ai, primaryModel, fallbackModel, contents, config, fallbackConfig } =
    params;

  const modelsToTry: Array<{
    model: string;
    cfg: typeof config;
    attempts: number;
  }> = [{ model: primaryModel, cfg: config, attempts: 3 }];

  if (fallbackModel && fallbackModel !== primaryModel) {
    modelsToTry.push({
      model: fallbackModel,
      cfg: fallbackConfig ?? config,
      attempts: 2,
    });
  }

  let lastError: unknown;

  for (const target of modelsToTry) {
    for (let attempt = 1; attempt <= target.attempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: target.model,
          contents,
          config: target.cfg,
        });
        return { response, modelUsed: target.model };
      } catch (err: unknown) {
        lastError = err;
        const retryable = isRetryableGeminiError(err);
        console.warn(
          `Gemini call failed (model=${target.model}, attempt=${attempt}/${target.attempts}, retryable=${retryable}):`,
          err instanceof Error ? err.message : err
        );

        if (!retryable) {
          throw err;
        }
        if (attempt < target.attempts) {
          const delayMs = 700 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 250);
          await sleep(delayMs);
        }
      }
    }
  }

  throw lastError;
}

interface ChatHistoryTurn {
  role: "user" | "model";
  text: string;
}

interface PatientContextPayload {
  name?: string;
  age?: number;
  gender?: string;
  recordNumber?: string;
  clinicalIndication?: string;
  comorbidities?: string[];
  allergies?: string[];
  currentMedications?: string[];
  renalFunction?: { creatinine: number; eGFR?: number; date: string };
  priorExams?: Array<{
    date: string;
    modality: string;
    region: string;
    summary: string;
  }>;
}

interface ExamContextPayload {
  id?: string;
  specialty?: string;
  transducer?: string;
  urgency?: string;
  manualFindingText?: string;
}

const REPORT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    urgencyLevel: {
      type: Type.STRING,
      description:
        "Nível de gravidade e urgência clínica: exatamente um entre EMERGENCY, URGENT, PRIORITY ou ELECTIVE.",
    },
    urgencyRationale: {
      type: Type.STRING,
      description: "Justificativa clínica objetiva para a classificação de urgência.",
    },
    technique: {
      type: Type.OBJECT,
      properties: {
        protocolName: { type: Type.STRING },
        transducerType: { type: Type.STRING },
        acousticWindows: { type: Type.STRING },
        patientPreparation: { type: Type.STRING },
        technicalLimitations: { type: Type.STRING },
      },
      required: [
        "protocolName",
        "transducerType",
        "acousticWindows",
        "patientPreparation",
      ],
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          region: { type: Type.STRING },
          description: { type: Type.STRING },
          measurements: { type: Type.STRING },
          significance: {
            type: Type.STRING,
            description:
              "Exatamente um entre: normal, benign, indeterminate, suspicious ou critical.",
          },
        },
        required: ["region", "description", "significance"],
      },
    },
    diagnosticImpression: {
      type: Type.OBJECT,
      properties: {
        primaryDiagnosis: { type: Type.STRING },
        differentialDiagnoses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        classificationScore: { type: Type.STRING },
        comparativeEvolution: { type: Type.STRING },
      },
      required: ["primaryDiagnosis", "differentialDiagnoses"],
    },
    riskStratification: {
      type: Type.OBJECT,
      properties: {
        level: {
          type: Type.STRING,
          description: "EMERGENCY, URGENT, PRIORITY ou ELECTIVE.",
        },
        clinicalFlags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        actionRecommendation: { type: Type.STRING },
      },
      required: ["level", "clinicalFlags", "actionRecommendation"],
    },
    recommendedSpecialists: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          specialty: { type: Type.STRING },
          timeframe: { type: Type.STRING },
          rationale: { type: Type.STRING },
        },
        required: ["specialty", "timeframe", "rationale"],
      },
    },
    complementaryExams: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          examName: { type: Type.STRING },
          modality: {
            type: Type.STRING,
            description:
              "Exatamente um entre: TC, RM, USG_DOPPLER, BIOPSIA_PAAF, LABORATORIO, ENDOSCOPIA, MAMOGRAFIA, OUTROS.",
          },
          urgency: { type: Type.STRING },
          clinicalJustification: { type: Type.STRING },
        },
        required: ["examName", "modality", "urgency", "clinicalJustification"],
      },
    },
    medicalLiterature: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          guidelineOrStudy: { type: Type.STRING },
          organizationOrJournal: { type: Type.STRING },
          year: { type: Type.INTEGER },
          evidenceLevel: { type: Type.STRING },
          summaryOfEvidence: { type: Type.STRING },
        },
        required: [
          "guidelineOrStudy",
          "organizationOrJournal",
          "year",
          "evidenceLevel",
          "summaryOfEvidence",
        ],
      },
    },
  },
  required: [
    "urgencyLevel",
    "urgencyRationale",
    "technique",
    "findings",
    "diagnosticImpression",
    "riskStratification",
    "recommendedSpecialists",
    "complementaryExams",
    "medicalLiterature",
  ],
};

function buildPatientContextText(
  patient?: PatientContextPayload,
  exam?: ExamContextPayload
): string {
  if (!patient) return "Sem dados do paciente informados.";
  const priorText =
    patient.priorExams && patient.priorExams.length > 0
      ? patient.priorExams
          .map(
            (p) =>
              `- [${p.date}] ${p.modality} (${p.region}): ${p.summary}`
          )
          .join("\n")
      : "Nenhum exame prévio registrado.";

  const renalText = patient.renalFunction
    ? `Creatinina: ${patient.renalFunction.creatinine} mg/dL${
        patient.renalFunction.eGFR
          ? `, eGFR: ${patient.renalFunction.eGFR}`
          : ""
      } (${patient.renalFunction.date})`
    : "Não informada";

  return [
    `PACIENTE: ${patient.name || "Não identificado"} | Idade: ${patient.age ?? "N/I"} anos | Sexo: ${patient.gender || "N/I"} | Prontuário: ${patient.recordNumber || "N/I"}`,
    `INDICAÇÃO CLÍNICA: ${patient.clinicalIndication || "Não informada"}`,
    `COMORBIDADES: ${(patient.comorbidities || []).join(", ") || "Nenhuma relatada"}`,
    `ALERGIAS: ${(patient.allergies || []).join(", ") || "Nega alergias"}`,
    `MEDICAÇÕES EM USO: ${(patient.currentMedications || []).join(", ") || "Nenhuma"}`,
    `FUNÇÃO RENAL: ${renalText}`,
    `EXAMES ANTERIORES COMPARATIVOS:\n${priorText}`,
    exam
      ? `EXAME ATUAL: Especialidade USG = ${exam.specialty || "Geral"} | Transdutor = ${exam.transducer || "Convexo/Linear"} | Achados já anotados = ${exam.manualFindingText || "Nenhum"}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  // Endpoint 1: Análise Estruturada de Ultrassom (Imagem ou Achado em Texto)
  app.post("/api/analyze-exam", async (req: Request, res: Response) => {
    try {
      const {
        patient,
        exam,
        inputMode,
        imageDataUrl,
        customFindingText,
        language,
      } = req.body as {
        patient?: PatientContextPayload;
        exam?: ExamContextPayload;
        inputMode?: "CAMERA_IMAGE" | "TEXT_FINDING";
        imageDataUrl?: string;
        customFindingText?: string;
        language?: "pt" | "en";
      };

      const isEnglish = language === "en";
      const ai = getAiClient();
      const contextText = buildPatientContextText(patient, exam);
      const findingDescription =
        customFindingText?.trim() ||
        exam?.manualFindingText?.trim() ||
        (isEnglish
          ? "Analyze the attached ultrasound image in correlation with the clinical context."
          : "Analisar a imagem ecográfica anexada em correlação com o quadro clínico.");

      const systemInstruction = isEnglish
        ? `You are UltrAI Med, a senior attending radiologist specialized in Diagnostic Ultrasound (USG) and emergency triage.
Your goal is to generate a high-precision structured medical report strictly in English, following the EXACT same 7-section formal standard whether receiving an ultrasound image or a confirmed textual finding description.

MANDATORY GUIDELINES:
1. Base your recommendations, scoring (ACR TI-RADS, BI-RADS USG, Tokyo Guidelines, Bosniak, ATLS E-FAST, EAU), and management EXCLUSIVELY on updated peer-reviewed medical literature and recognized guidelines (ACR, AIUM, CBR, ATLS, EAU, WSES). Cite year, society/journal, and evidence level.
2. Always integrate the patient's full longitudinal history (prior comparative exams, renal function/eGFR prior to suggesting contrast exams, allergies, and comorbidities).
3. Strictly classify clinical urgency as EMERGENCY, URGENT, PRIORITY, or ELECTIVE.
4. Clearly specify recommended specialist referrals (with timeframe) and complementary lab or imaging exams.`
        : `Você é o UltrAI Med, um médico radiologista especialista sênior em Ultrassonografia Diagnóstica (USG) e triagem de emergências.
Seu objetivo é gerar um laudo médico estruturado de alta precisão em português do Brasil, seguindo EXATAMENTE o mesmo padrão formal de 7 seções tanto quando recebe uma imagem ecográfica quanto quando recebe apenas a descrição textual de um achado confirmado.

DIRETRIZES OBRIGATÓRIAS:
1. Baseie suas recomendações, escores (ACR TI-RADS, BI-RADS USG, Critérios de Tóquio, Bosniak, ATLS E-FAST, EAU) e condutas EXCLUSIVAMENTE em literatura médica atualizada e diretrizes internacionais/nacionais reconhecidas (ACR, AIUM, CBR, ATLS, EAU, WSES, SBEM). Cite ano, sociedade/periódico e nível de evidência.
2. Integre sempre o histórico completo do paciente (exames anteriores comparativos, função renal/eGFR antes de sugerir exames com contraste, alergias e comorbidades).
3. Classifique com rigor a urgência clínica em EMERGENCY (risco imediato de morte), URGENT (conduta aguda nas próximas horas), PRIORITY (investigação rápida/biópsia em dias) ou ELECTIVE (rotina).
4. Indique objetivamente quais outros especialistas devem avaliar o paciente (com prazo) e quais exames complementares laboratoriais ou de imagem são necessários.`;

      const userPrompt = isEnglish
        ? `INPUT MODE: ${
            inputMode === "CAMERA_IMAGE"
              ? "Ultrasound image provided by the physician"
              : "Text description of confirmed finding by the radiologist"
          }

${contextText}

FINDINGS / RADIOLOGIST REQUEST:
${findingDescription}

Generate the complete structured report in JSON matching the specified schema. All descriptive fields MUST be in English.`
        : `MODO DE ENTRADA: ${
            inputMode === "CAMERA_IMAGE"
              ? "Imagem de Ultrassonografia enviada pelo médico"
              : "Descrição textual de achado confirmado pelo radiologista"
          }

${contextText}

ACHADOS / SOLICITAÇÃO DO RADIOLOGISTA:
${findingDescription}

Gere o laudo estruturado completo em JSON conforme o schema especificado.`;

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      if (imageDataUrl) {
        const parsed = parseDataUrl(imageDataUrl);
        if (parsed) {
          parts.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data,
            },
          });
        }
      }
      parts.push({ text: userPrompt });

      const { response } = await generateWithRetryAndFallback({
        ai,
        primaryModel: PRIMARY_CLINICAL_MODEL,
        fallbackModel: FALLBACK_FAST_MODEL,
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: REPORT_RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
        fallbackConfig: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: REPORT_RESPONSE_SCHEMA,
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsedReport = JSON.parse(rawText);

      res.json({ report: parsedReport });
    } catch (err: unknown) {
      console.error("Erro em /api/analyze-exam:", err);
      const { statusCode, message } = formatFriendlyGeminiError(
        err,
        (req.body as { language?: "pt" | "en" } | undefined)?.language
      );
      res.status(statusCode).json({ error: message });
    }
  });

  // Endpoint 2: Chatbot Radiológico Multi-Turno (Gemini)
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const {
        messages,
        patient,
        exam,
        reportSummary,
        imageDataUrl,
        attachImage,
        modelMode,
        language,
      } = req.body as {
        messages: ChatHistoryTurn[];
        patient?: PatientContextPayload;
        exam?: ExamContextPayload;
        reportSummary?: string;
        imageDataUrl?: string;
        attachImage?: boolean;
        modelMode?: "reasoning" | "fast";
        language?: "pt" | "en";
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Envie ao menos uma mensagem." });
        return;
      }

      const isEnglish = language === "en";
      const ai = getAiClient();
      const isFast = modelMode === "fast";
      const selectedModel = isFast
        ? FALLBACK_FAST_MODEL
        : PRIMARY_CLINICAL_MODEL;

      const contextText = buildPatientContextText(patient, exam);

      const systemInstruction = isEnglish
        ? `You are UltrAI Med Chat, a medical copilot specialized in Radiology and Diagnostic Ultrasound (USG) integrated into the radiologist's workstation.

YOUR ROLE:
- Answer the radiologist's clinical questions during scanning and reporting (TI-RADS, BI-RADS USG, Bosniak criteria, normal anatomical measurements, differential diagnoses, urgent management, contrast contraindications given renal function/allergies).
- When an ultrasound image is attached, carefully describe what you observe in the image (anatomical structures, echogenicity, margins, acoustic shadowing/enhancement, fluid collections, Doppler signals if present, and possible artifacts) and provide a clear clinical impression.
- Maintain an objective, accurate, collaborative medical tone strictly in English.
- Cite updated clinical guidelines and consensus statements (ACR, AIUM, CBR, ATLS, EAU, Fleischner, SBU, SBEM) whenever backing recommendations.
- Never fabricate clinical data; if key patient or exam info is missing, clearly notify the physician.

ACTIVE PATIENT CLINICAL CONTEXT:
${contextText}
${reportSummary ? `\nCURRENT GENERATED REPORT:\n${reportSummary}` : ""}`
        : `Você é o UltrAI Med Chat, um copiloto médico especialista em Radiologia e Ultrassonografia (USG) integrado à estação de trabalho do médico radiologista.

SEU PAPEL:
- Responder dúvidas clínicas do radiologista durante o exame e a confecção do laudo (critérios TI-RADS, BI-RADS USG, Bosniak, medidas anatômicas normais, diagnósticos diferenciais, condutas de urgência, preparo e contraindicações de exames complementares considerando função renal/alergias do paciente).
- Quando uma imagem de ultrassonografia for enviada, descreva objetivamente o que você está vendo na imagem (estruturas anatômicas visíveis, ecogenicidade, contornos, sombra/reforço acústico posterior, coleções líquidas, sinais ao Doppler se presentes e possíveis artefatos) e apresente a impressão diagnóstica provável.
- Manter tom médico objetivo, preciso e colaborativo em português do Brasil.
- Citar diretrizes e consensos médicos atualizados (ACR, AIUM, CBR, ATLS, EAU, Fleischner, SBU, SBEM) sempre que embasar uma recomendação.
- Nunca inventar dados clínicos não fornecidos; caso falte uma informação do exame ou histórico, sinalizar claramente ao médico.

CONTEXTO CLÍNICO ATIVO DO PACIENTE:
${contextText}
${reportSummary ? `\nLAUDO ATUAL GERADO:\n${reportSummary}` : ""}`;

      // Constrói o histórico multi-turno para o Gemini
      const contents = messages.map((turn, idx) => {
        const isLastUserTurn =
          idx === messages.length - 1 && turn.role === "user";
        const parts: Array<
          | { text: string }
          | { inlineData: { mimeType: string; data: string } }
        > = [];

        if (isLastUserTurn && attachImage && imageDataUrl) {
          const parsed = parseDataUrl(imageDataUrl);
          if (parsed) {
            parts.push({
              inlineData: {
                mimeType: parsed.mimeType,
                data: parsed.data,
              },
            });
          }
        }

        parts.push({ text: turn.text });
        return {
          role: turn.role,
          parts,
        };
      });

      const { response, modelUsed } = await generateWithRetryAndFallback({
        ai,
        primaryModel: selectedModel,
        fallbackModel: isFast ? PRIMARY_CLINICAL_MODEL : FALLBACK_FAST_MODEL,
        contents,
        config: isFast
          ? { systemInstruction }
          : {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
            },
        fallbackConfig: { systemInstruction },
      });

      res.json({
        reply:
          response.text ||
          (isEnglish
            ? "Unable to generate a clinical response at this moment."
            : "Não foi possível gerar uma resposta clínica no momento."),
        modelUsed,
      });
    } catch (err: unknown) {
      console.error("Erro em /api/chat:", err);
      const { statusCode, message } = formatFriendlyGeminiError(
        err,
        (req.body as { language?: "pt" | "en" } | undefined)?.language
      );
      res.status(statusCode).json({ error: message });
    }
  });

  // Vite middleware para desenvolvimento, ou arquivos estáticos em produção
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UltrAI Med server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
