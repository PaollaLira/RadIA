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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Falha ao consultar o assistente RadIA.');
    }

    return {
      reply: data.reply,
      modelUsed: data.modelUsed,
    };
  }
}
