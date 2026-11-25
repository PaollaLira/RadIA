import { ChatMessage, ChatModelMode } from '../types/chat';
import { Patient } from '../types/patient';
import { UltrasoundExam } from '../types/ultrasound';
import { StandardizedRadiologyReport } from '../types/report';
import { AppLanguage } from '../i18n/translations';

export class ChatService {
  public static async sendMessage(params: {
    messages: ChatMessage[];
    patient?: Patient;
    exam?: UltrasoundExam;
    report?: StandardizedRadiologyReport | null;
    imageDataUrl?: string | null;
    attachImage?: boolean;
    modelMode: ChatModelMode;
    language?: AppLanguage;
  }): Promise<{ reply: string; modelUsed: string }> {
    const reportSummary = params.report
      ? `Diagnóstico Principal: ${params.report.diagnosticImpression.primaryDiagnosis} | Urgência: ${params.report.urgencyLevel} | Conduta: ${params.report.riskStratification.actionRecommendation}`
      : undefined;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: params.messages.map((m) => ({
          role: m.role,
          text: m.text,
        })),
        patient: params.patient,
        exam: params.exam,
        reportSummary,
        imageDataUrl: params.attachImage ? params.imageDataUrl : undefined,
        attachImage: !!params.attachImage,
        modelMode: params.modelMode,
        language: params.language || 'pt',
      }),
    });

    const rawBody = await response.text();
    let data: { reply?: string; modelUsed?: string; error?: string } = {};
    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      data = {};
    }

    if (!response.ok || !data.reply) {
      throw new Error(
        data.error ||
          (response.status === 503
            ? params.language === 'en'
              ? 'The AI service is temporarily experiencing high demand. Please wait a few seconds and try again.'
              : 'O serviço de IA está temporariamente com alta demanda. Aguarde alguns segundos e tente novamente.'
            : params.language === 'en'
              ? 'Failed to communicate with UltrAI Med assistant.'
              : 'Falha ao consultar o assistente UltrAI Med.')
      );
    }

    return {
      reply: data.reply,
      modelUsed: data.modelUsed || '',
    };
  }
}
