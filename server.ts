import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

type AppLang = "pt" | "en" | "es";

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
  language?: AppLang
): { statusCode: number; message: string } {
  const lang: AppLang = language === "en" || language === "es" ? language : "pt";
  const code = getErrorStatusCode(err);
  const rawMsg = err instanceof Error ? err.message : String(err || "");

  if (
    code === 503 ||
    /UNAVAILABLE|high demand|overloaded/i.test(rawMsg)
  ) {
    return {
      statusCode: 503,
      message:
        lang === "en"
          ? "The AI service is temporarily experiencing high demand. Please wait a few seconds and try again."
          : lang === "es"
          ? "El servicio de IA está experimentando alta demanda temporalmente. Espere unos segundos e inténtelo de nuevo."
          : "O serviço de IA está temporariamente com alta demanda. Aguarde alguns segundos e tente novamente.",
    };
  }

  if (
    code === 429 ||
    /RESOURCE_EXHAUSTED|quota|rate limit/i.test(rawMsg)
  ) {
    return {
      statusCode: 429,
      message:
        lang === "en"
          ? "API request limit temporarily reached. Please wait a moment and try again, or check your key in Settings > Secrets."
          : lang === "es"
          ? "Se alcanzó temporalmente el límite de solicitudes de la API. Espere un momento e inténtelo de nuevo o verifique su clave en Settings > Secrets."
          : "Limite temporário de requisições da API atingido. Aguarde um momento e tente novamente, ou verifique sua chave em Settings > Secrets.",
    };
  }

  if (
    code === 403 ||
    /PERMISSION_DENIED|API_KEY_INVALID|API key not valid/i.test(rawMsg)
  ) {
    return {
      statusCode: 403,
      message:
        lang === "en"
          ? "Gemini API key is invalid or lacks permission. Please verify it in Settings > Secrets."
          : lang === "es"
          ? "La clave de API de Gemini no es válida o no tiene permisos. Verifíquela en Settings > Secrets."
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
      (lang === "en"
        ? "Failed to process clinical analysis with AI. Please try again."
        : lang === "es"
        ? "Error al procesar el análisis clínico con la IA. Inténtelo de nuevo."
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
        return response;
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
}

interface ExamContextPayload {
  specialty?: string;
  transducer?: string;
  manualFindingText?: string;
}

const REPORT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
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
      description:
        "Lista objetiva de achados anatômicos da região examinada, incluindo estruturas alteradas e demais estruturas normais esperadas na região (1 frase curta e direta por estrutura quando normal).",
      items: {
        type: Type.OBJECT,
        properties: {
          region: { type: Type.STRING },
          description: { type: Type.STRING },
          measurements: { type: Type.STRING },
        },
        required: ["region", "description"],
      },
    },
    diagnosticImpression: {
      type: Type.OBJECT,
      properties: {
        primaryDiagnosis: { type: Type.STRING },
        differentialDiagnoses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description:
            "Lista vazia ([]) quando o exame for normal ou sem achados significativos.",
        },
        classificationScore: { type: Type.STRING },
        comparativeEvolution: { type: Type.STRING },
      },
      required: ["primaryDiagnosis", "differentialDiagnoses"],
    },
    medicalLiterature: {
      type: Type.ARRAY,
      description:
        "Máximo de 1 referência resumida quando exame normal, ou até 2 referências objetivas quando houver alterações.",
      items: {
        type: Type.OBJECT,
        properties: {
          guidelineOrStudy: { type: Type.STRING },
          organizationOrJournal: { type: Type.STRING },
          year: { type: Type.INTEGER },
          summaryOfEvidence: {
            type: Type.STRING,
            description: "Resumo de 1 frase curta (máximo 18 palavras).",
          },
        },
        required: [
          "guidelineOrStudy",
          "organizationOrJournal",
          "year",
          "summaryOfEvidence",
        ],
      },
    },
  },
  required: [
    "technique",
    "findings",
    "diagnosticImpression",
    "medicalLiterature",
  ],
};

function buildPatientContextText(
  patient?: PatientContextPayload,
  exam?: ExamContextPayload
): string {
  if (!patient) return "Sem dados do paciente informados.";
  return [
    `PACIENTE: ${patient.name || "Não identificado"} | Idade: ${
      patient.age && patient.age > 0 ? `${patient.age} anos` : "N/I"
    } | Sexo: ${patient.gender || "N/I"}`,
    exam
      ? `EXAME ATUAL: Especialidade/Região USG = ${exam.specialty || "Geral"} | Transdutor = ${exam.transducer || "Convexo/Linear"} | Achados já anotados = ${exam.manualFindingText || "Nenhum"}`
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
        language?: AppLang;
      };

      const lang: AppLang = language === "en" || language === "es" ? language : "pt";
      const ai = getAiClient();
      const contextText = buildPatientContextText(patient, exam);
      const findingDescription =
        customFindingText?.trim() ||
        exam?.manualFindingText?.trim() ||
        (lang === "en"
          ? "Analyze the attached ultrasound image in correlation with the clinical context."
          : lang === "es"
          ? "Analizar la imagen ecográfica adjunta en correlación con el contexto clínico."
          : "Analisar a imagem ecográfica anexada em correlação com o quadro clínico.");

      const systemInstruction =
        lang === "en"
          ? `You are UltrAI Med, a senior attending radiologist specialized in Diagnostic Ultrasound (USG).
Your goal is to generate a concise, objective, high-precision structured medical report strictly in English, following the EXACT same 4-section formal standard whether receiving an ultrasound image or a confirmed textual finding description.

MANDATORY GUIDELINES:
1. COMPLETE YET OBJECTIVE REGIONAL FINDINGS: In Section 2 ("findings"), list BOTH any altered findings AND the expected normal anatomical structures of that specialty/region (e.g., Abdomen: liver, gallbladder, bile ducts, pancreas, spleen, kidneys, aorta/IVC; Cervical/Thyroid: lobes, isthmus, salivary glands, lymph nodes; MSK: key tendons, ligaments, bursae/joint recesses, muscle bellies, cortical bone; Obstetric: vitality/FHR, biometry, placenta, amniotic fluid, cervix; Soft Tissues/Axillae: skin, subcutaneous tissue, muscle planes, lymph nodes).
2. EXTRA BREVITY WHEN NO SIGNIFICANT FINDINGS ARE PRESENT: When the exam is normal or the input states "No significant findings", keep the entire report direct and telegraphic—use 1 short sentence per normal structure, state a direct normal conclusion in "primaryDiagnosis", leave "differentialDiagnoses" as an empty array [], omit "classificationScore", and omit "technicalLimitations" unless explicitly reported. Do NOT recommend clinical management or immediate conduct.
3. SUMMARIZED REFERENCES: In Section 4 ("medicalLiterature"), provide ONLY 1 summarized reference when normal (or at most 2 when altered), citing recognized guidelines (ACR, AIUM, CBR, EAU, ISUOG, ESSR) with year and a single concise sentence (max ~18 words) in "summaryOfEvidence".
4. Integrate relevant longitudinal patient history (prior exams, comorbidities) concisely when available.`
          : lang === "es"
          ? `Eres UltrAI Med, un médico radiólogo especialista sénior en Ultrasonografía Diagnóstica (USG).
Tu objetivo es generar un informe médico estructurado conciso, objetivo y de alta precisión estrictamente en español, siguiendo EXACTAMENTE el mismo estándar formal de 4 secciones tanto al recibir una imagen ecográfica como al recibir una descripción textual confirmada.

DIRECTRICES OBLIGATORIAS:
1. HALLAZGOS REGIONALES COMPLETOS Y OBJETIVOS: En la Sección 2 ("findings"), describe TANTO los hallazgos alterados COMO las demás estructuras anatómicas normales esperadas de esa especialidad/región (p. ej., Abdomen: hígado, vesícula, vías biliares, páncreas, bazo, riñones, aorta/VCI; Cervical/Tiroides: lóbulos, istmo, glándulas salivales, ganglios; Musculoesquelético: tendones, ligamentos, bursas/recesos, planos musculares, cortical ósea; Obstétrico: vitalidad/FCF, biometría, placenta, líquido amniótico, cérvix; Partes Blandas/Axilas: piel, tejido subcutáneo, planos musculares, ganglios).
2. MÁXIMA OBJETIVIDAD SIN HALLAZGOS SIGNIFICATIVOS: Cuando el estudio sea normal o indique "Sin hallazgos significativos", redacta un informe directo y telegráfico: 1 frase corta por estructura normal, conclusión directa de normalidad en "primaryDiagnosis", "differentialDiagnoses" vacío ([]), sin "classificationScore" y sin "technicalLimitations" salvo indicación expresa. NO incluyas conducta clínica inmediata.
3. REFERENCIAS RESUMIDAS: En la Sección 4 ("medicalLiterature"), incluye SOLO 1 referencia resumida en estudios normales (o máximo 2 si hay alteraciones), citando guías reconocidas (ACR, AIUM, CBR, EAU, ISUOG, ESSR), año y una sola frase breve (máximo ~18 palabras) en "summaryOfEvidence".
4. Integra antecedentes previos relevantes solo si existen y aportan valor diagnóstico.`
          : `Você é o UltrAI Med, um médico radiologista especialista sênior em Ultrassonografia Diagnóstica (USG).
Seu objetivo é gerar um laudo médico estruturado enxuto, objetivo e de alta precisão em português do Brasil, seguindo EXATAMENTE o mesmo padrão formal de 4 seções tanto quando recebe uma imagem ecográfica quanto quando recebe a descrição textual de um achado.

DIRETRIZES OBRIGATÓRIAS:
1. ACHADOS REGIONAIS COMPLETOS E OBJETIVOS: Na Seção 2 ("findings"), inclua TANTO eventuais alterações informadas/observadas QUANTO as demais estruturas anatômicas normais esperadas para a especialidade/região (ex.: Abdome: Fígado, Vesícula Biliar, Vias Biliares, Pâncreas, Baço, Rins, Aorta/VCI; Cervical/Tireoide: lobos, istmo, glândulas salivares (parótidas e submandibulares), linfonodos cervicais; Músculo-Esquelético: tendões principais, ligamentos, bursas/recessos, ventres musculares e cortical óssea; Obstétrico: vitalidade/FCF, biometria, placenta, líquido amniótico e colo uterino; Axilas/Partes Moles: pele, subcutâneo, planos musculares e linfonodos).
2. OBJETIVIDADE MÁXIMA QUANDO NÃO HOUVER ACHADOS SIGNIFICATIVOS: Quando o exame for normal ou o texto indicar "Sem achados significativos", seja telegráfico e direto: use apenas 1 frase curta por estrutura normal (sem prolixidade), conclua de forma objetiva em "primaryDiagnosis" (ex.: "Exame ultrassonográfico dentro dos limites da normalidade."), deixe "differentialDiagnoses" como array vazio [], omita "classificationScore" e omita "technicalLimitations" se não houver limitações. NÃO inclua seção ou texto de conduta clínica imediata.
3. REFERÊNCIAS RESUMIDAS: Na Seção 4 ("medicalLiterature"), traga APENAS 1 referência resumida em exames normais (ou no máximo 2 quando houver alterações/escores como TI-RADS/BI-RADS), citando diretrizes reconhecidas (ACR, AIUM, CBR, EAU, ISUOG, ESSR), ano e uma única frase curta (máximo ~18 palavras) em "summaryOfEvidence".
4. Integre exames anteriores comparativos ou comorbidades apenas quando relevantes ao laudo.`;

      const userPrompt =
        lang === "en"
          ? `INPUT MODE: ${
              inputMode === "CAMERA_IMAGE"
                ? "Ultrasound image provided by the physician"
                : "Text description of confirmed finding by the radiologist"
            }

${contextText}

FINDINGS / RADIOLOGIST REQUEST:
${findingDescription}

Generate the concise 4-section structured report in JSON matching the specified schema. Include both altered findings (if any) and normal regional structures in "findings". All descriptive fields MUST be in English.`
          : lang === "es"
          ? `MODO DE ENTRADA: ${
              inputMode === "CAMERA_IMAGE"
                ? "Imagen de Ultrasonografía enviada por el médico"
                : "Descripción textual de hallazgo confirmado por el médico"
            }

${contextText}

HALLAZGOS / SOLICITUD DEL MÉDICO:
${findingDescription}

Genere el informe estructurado conciso de 4 secciones en JSON según el esquema especificado. Incluya tanto los hallazgos alterados (si los hay) como las estructuras regionales normales en "findings". Todos los campos descriptivos DEBEN estar en español.`
          : `MODO DE ENTRADA: ${
              inputMode === "CAMERA_IMAGE"
                ? "Imagem de Ultrassonografia enviada pelo médico"
                : "Descrição textual de achado confirmado pelo radiologista"
            }

${contextText}

ACHADOS / SOLICITAÇÃO DO RADIOLOGISTA:
${findingDescription}

Gere o laudo estruturado enxuto e objetivo de 4 seções em JSON conforme o schema especificado, incluindo eventuais achados alterados e as demais estruturas normais da região em "findings".`;

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

      const response = await generateWithRetryAndFallback({
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
        (req.body as { language?: AppLang } | undefined)?.language
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
        language?: AppLang;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: "Envie ao menos uma mensagem." });
        return;
      }

      const lang: AppLang = language === "en" || language === "es" ? language : "pt";
      const ai = getAiClient();
      const isFast = modelMode === "fast";
      const selectedModel = isFast
        ? FALLBACK_FAST_MODEL
        : PRIMARY_CLINICAL_MODEL;

      const contextText = buildPatientContextText(patient, exam);

      const systemInstruction =
        lang === "en"
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
          : lang === "es"
          ? `Eres UltrAI Med Chat, un copiloto médico especialista en Radiología y Ultrasonografía Diagnóstica (USG) integrado en la estación de trabajo del médico radiólogo.

TU ROL:
- Responder dudas clínicas durante el examen y la redacción del informe (criterios TI-RADS, BI-RADS USG, Bosniak, medidas anatómicas normales, diagnósticos diferenciales, conducta de urgencia, contraindicaciones de contraste según función renal y alergias).
- Cuando se envíe una imagen ecográfica, describe objetivamente lo que observas (estructuras anatómicas visibles, ecogenicidad, contornos, sombra/refuerzo acústico posterior, colecciones líquidas, señales Doppler y posibles artefactos) y presenta la impresión diagnóstica probable.
- Mantener un tono médico objetivo, preciso y colaborativo estrictamente en español.
- Citar guías y consensos médicos actualizados (ACR, AIUM, CBR, ATLS, EAU, ISUOG, ESSR, Fleischner) al respaldar recomendaciones.
- Nunca inventar datos clínicos no proporcionados; si falta información del estudio o antecedentes, indicarlo claramente al médico.

CONTEXTO CLÍNICO ACTIVO DEL PACIENTE:
${contextText}
${reportSummary ? `\nINFORME ACTUAL GENERADO:\n${reportSummary}` : ""}`
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

      const response = await generateWithRetryAndFallback({
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
          (lang === "en"
            ? "Unable to generate a clinical response at this moment."
            : lang === "es"
            ? "No fue posible generar una respuesta clínica en este momento."
            : "Não foi possível gerar uma resposta clínica no momento."),
      });
    } catch (err: unknown) {
      console.error("Erro em /api/chat:", err);
      const { statusCode, message } = formatFriendlyGeminiError(
        err,
        (req.body as { language?: AppLang } | undefined)?.language
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
