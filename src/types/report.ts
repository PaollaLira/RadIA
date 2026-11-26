export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'PRIORITY' | 'ELECTIVE';

export interface ReportFinding {
  region: string;
  description: string;
  measurements?: string;
  significance: 'normal' | 'benign' | 'indeterminate' | 'suspicious' | 'critical';
}

export interface RecommendedSpecialist {
  specialty: string;
  timeframe: string;
  rationale: string;
}

export interface ComplementaryExam {
  examName: string;
  modality: 'TC' | 'RM' | 'USG_DOPPLER' | 'BIOPSIA_PAAF' | 'LABORATORIO' | 'ENDOSCOPIA' | 'MAMOGRAFIA' | 'OUTROS';
  urgency: string;
  clinicalJustification: string;
}

export interface MedicalCitation {
  guidelineOrStudy: string;
  organizationOrJournal: string;
  year: number;
  evidenceLevel: string;
  summaryOfEvidence: string;
}

export interface StandardizedRadiologyReport {
  id: string;
  examId: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;

  // Metadados de triagem
  urgencyLevel: UrgencyLevel;
  urgencyRationale: string;
  inputModeUsed: 'CAMERA_IMAGE' | 'TEXT_FINDING';

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
    level: UrgencyLevel;
    clinicalFlags: string[];
    actionRecommendation: string;
  };

  // Campos legados opcionais mantidos para compatibilidade com laudos salvos anteriormente
  recommendedSpecialists?: RecommendedSpecialist[];
  complementaryExams?: ComplementaryExam[];

  // 5. EMBASAMENTO EM LITERATURA MÉDICA & DIRETRIZES ATUALIZADAS
  medicalLiterature: MedicalCitation[];

  // Assinatura médica do radiologista
  physicianNotes?: string;
  signedByRadiologist: boolean;
  radiologistName?: string;
  crm?: string;
}
