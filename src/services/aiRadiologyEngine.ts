import { Patient } from '../types/patient';
import { UltrasoundExam } from '../types/ultrasound';
import { StandardizedRadiologyReport } from '../types/report';
import { AppLanguage } from '../i18n/translations';

class AiRadiologyEngine {
  /**
   * Processa a análise do exame de ultrassonografia via Gemini no backend (/api/analyze-exam)
   * e retorna o laudo estruturado completo no padrão de 5 seções para imagem ou texto.
   */
  public static async analyzeExam(
    exam: UltrasoundExam,
    patient: Patient,
    options: {
      inputMode: 'CAMERA_IMAGE' | 'TEXT_FINDING';
      imageDataUrl?: string;
      customFindingText?: string;
      language?: AppLanguage;
    }
  ): Promise<StandardizedRadiologyReport> {
    const lang = options.language || 'pt';
    const response = await fetch('/api/analyze-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient,
        exam,
        inputMode: options.inputMode,
        imageDataUrl: options.imageDataUrl,
        customFindingText: options.customFindingText,
        language: lang,
      }),
    });

    const rawBody = await response.text();
    let data: { report?: StandardizedRadiologyReport; error?: string } = {};
    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      data = {};
    }

    if (!response.ok || !data.report) {
      throw new Error(
        data.error ||
          (response.status === 503
            ? lang === 'en'
              ? 'The AI service is temporarily experiencing high demand. Please wait a few seconds and try again.'
              : lang === 'es'
              ? 'El servicio de IA tiene alta demanda temporalmente. Espere unos segundos e inténtelo de nuevo.'
              : 'O serviço de IA está temporariamente com alta demanda. Aguarde alguns segundos e tente novamente.'
            : lang === 'en'
              ? 'Failed to process clinical ultrasound analysis with AI.'
              : lang === 'es'
              ? 'Error al procesar el análisis ecográfico con la IA.'
              : 'Erro ao processar análise ecográfica com a IA.')
      );
    }

    const r = data.report;
    const now = new Date().toISOString();

    const report: StandardizedRadiologyReport = {
      examId: exam.id,
      createdAt: now,
      urgencyLevel: r.urgencyLevel || 'PRIORITY',
      urgencyRationale: r.urgencyRationale || '',
      technique: r.technique,
      findings: r.findings || [],
      diagnosticImpression: r.diagnosticImpression,
      riskStratification: r.riskStratification,
      medicalLiterature: r.medicalLiterature || [],
    };

    return report;
  }
}

export const aiRadiologyEngine = AiRadiologyEngine;
