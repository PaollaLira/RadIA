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
        ? `You are RadIA, a senior attending radiologist specialized in Diagnostic Ultrasound (USG) and emergency triage.
Your goal is to generate a high-precision structured medical report strictly in English, following the EXACT same 7-section formal standard whether receiving an ultrasound image or a confirmed textual finding description.

MANDATORY GUIDELINES:
1. Base your recommendations, scoring (ACR TI-RADS, BI-RADS USG, Tokyo Guidelines, Bosniak, ATLS E-FAST, EAU), and management EXCLUSIVELY on updated peer-reviewed medical literature and recognized guidelines (ACR, AIUM, CBR, ATLS, EAU, WSES). Cite year, society/journal, and evidence level.
2. Always integrate the patient's full longitudinal history (prior comparative exams, renal function/eGFR prior to suggesting contrast exams, allergies, and comorbidities).
3. Strictly classify clinical urgency as EMERGENCY, URGENT, PRIORITY, or ELECTIVE.
4. Clearly specify recommended specialist referrals (with timeframe) and complementary lab or imaging exams.`
        : `Você é o RadIA, um médico radiologista especialista sênior em Ultrassonografia Diagnóstica (USG) e triagem de emergências.
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

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: REPORT_RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      const parsedReport = JSON.parse(rawText);

      res.json({ report: parsedReport });
    } catch (err: unknown) {
      console.error("Erro em /api/analyze-exam:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao processar análise diagnóstica com Gemini.";
      res.status(500).json({ error: message });
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
        ? "gemini-3.1-flash-lite"
        : "gemini-3.8-flash";

      const contextText = buildPatientContextText(patient, exam);

      const systemInstruction = isEnglish
        ? `You are RadIA Chat, a medical copilot specialized in Radiology and Diagnostic Ultrasound (USG) integrated into the radiologist's workstation.

YOUR ROLE:
- Answer the radiologist's clinical questions during scanning and reporting (TI-RADS, BI-RADS USG, Bosniak criteria, normal anatomical measurements, differential diagnoses, urgent management, contrast contraindications given renal function/allergies).
- Maintain an objective, accurate, collaborative medical tone strictly in English.
- Cite updated clinical guidelines and consensus statements (ACR, AIUM, CBR, ATLS, EAU, Fleischner, SBU, SBEM) whenever backing recommendations.
- Never fabricate clinical data; if key patient or exam info is missing, clearly notify the physician.

ACTIVE PATIENT CLINICAL CONTEXT:
${contextText}
${reportSummary ? `\nCURRENT GENERATED REPORT:\n${reportSummary}` : ""}`
        : `Você é o RadIA Chat, um copiloto médico especialista em Radiologia e Ultrassonografia (USG) integrado à estação de trabalho do médico radiologista.

SEU PAPEL:
- Responder dúvidas clínicas do radiologista durante o exame e a confecção do laudo (critérios TI-RADS, BI-RADS USG, Bosniak, medidas anatômicas normais, diagnósticos diferenciais, condutas de urgência, preparo e contraindicações de exames complementares considerando função renal/alergias do paciente).
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

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: isFast
          ? { systemInstruction }
          : {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
            },
      });

      res.json({
        reply:
          response.text ||
          "Não foi possível gerar uma resposta clínica no momento.",
        modelUsed: selectedModel,
      });
    } catch (err: unknown) {
      console.error("Erro em /api/chat:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao comunicar com o assistente RadIA.";
      res.status(500).json({ error: message });
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
    console.log(`RadIA server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
