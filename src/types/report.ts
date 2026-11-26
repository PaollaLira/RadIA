type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'PRIORITY' | 'ELECTIVE';

interface ReportFinding {
  region: string;
  description: string;
  measurements?: string;
}

interface MedicalCitation {
  guidelineOrStudy: string;
  organizationOrJournal: string;
  year: number;
  evidenceLevel: string;
  summaryOfEvidence: string;
}

export interface StandardizedRadiologyReport {
  examId: string;
  createdAt: string;

  // Metadados de triagem
  urgencyLevel: UrgencyLevel;
  urgencyRationale: string;

  // 1. TÉCNICA E PROTOCOLO DO EXAME
  technique: {
    protocolName: string;
    transducerType: string;
    acousticWindows: string;
    patientPreparation: string;
    technicalLimitations?: string;
  };

  // 2. ACHADOS RADIOLÓGICOS DETALHADOS (estruturas normais + alteradas)
  findings: ReportFinding[];

  // 3. IMPRESSÃO DIAGNÓSTICA & DIAGNÓSTICO DIFERENCIAL
  diagnosticImpression: {
    primaryDiagnosis: string;
    differentialDiagnoses: string[];
    classificationScore?: string;
    comparativeEvolution?: string;
  };

  // 4. ESTRATIFICAÇÃO DE RISCO & GRAVIDADE
  riskStratification: {
    clinicalFlags: string[];
    actionRecommendation: string;
  };

  // 5. EMBASAMENTO EM LITERATURA MÉDICA & DIRETRIZES ATUALIZADAS
  medicalLiterature: MedicalCitation[];

  // Assinatura médica do radiologista
  radiologistName?: string;
  crm?: string;
}
