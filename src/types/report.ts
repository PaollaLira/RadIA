export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'PRIORITY' | 'ELECTIVE';

export interface ReportFinding {
  region: string;
  description: string;
  measurements?: string;
  significance: 'normal' | 'benign' | 'indeterminate' | 'suspicious' | 'critical';
}

export interface RecommendedSpecialist {
  specialty: string;
  timeframe: string; // Ex: "Imediato / Plantão", "Em até 24h-48h", "Ambulatorial Eletivo"
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
  organizationOrJournal: string; // Ex: "ACR (American College of Radiology)", "AIUM", "CBR", "Fleischner Society"
  year: number;
  evidenceLevel: string; // Ex: "Classe I, Nível A", "Consenso de Especialistas"
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

  // 2. ACHADOS RADIOLÓGICOS DETALHADOS
  findings: ReportFinding[];

  // 3. IMPRESSÃO DIAGNÓSTICA & DIAGNÓSTICO DIFERENCIAL
  diagnosticImpression: {
    primaryDiagnosis: string;
    differentialDiagnoses: string[];
    classificationScore?: string; // Ex: "ACR TI-RADS 5", "BI-RADS USG 4B", "Colecistite Aguda Grau II"
    comparativeEvolution?: string; // Comparação com exames anteriores do paciente
  };

  // 4. ESTRATIFICAÇÃO DE RISCO & GRAVIDADE
  riskStratification: {
    level: UrgencyLevel;
    clinicalFlags: string[]; // Ex: "Sinal de Murphy ecográfico", "Líquido livre perivesicular"
    actionRecommendation: string;
  };

  // 5. ESPECIALISTAS RECOMENDADOS PARA ENCAMINHAMENTO
  recommendedSpecialists: RecommendedSpecialist[];

  // 6. EXAMES COMPLEMENTARES SUGERIDOS E CONDUTA
  complementaryExams: ComplementaryExam[];

  // 7. EMBASAMENTO EM LITERATURA MÉDICA & DIRETRIZES ATUALIZADAS
  medicalLiterature: MedicalCitation[];

  // Assinatura médica do radiologista
  physicianNotes?: string;
  signedByRadiologist: boolean;
  radiologistName?: string;
  crm?: string;
}
