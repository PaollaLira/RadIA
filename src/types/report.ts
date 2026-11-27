interface ReportFinding {
  region: string;
  description: string;
  measurements?: string;
}

interface MedicalCitation {
  guidelineOrStudy: string;
  organizationOrJournal: string;
  year: number;
  summaryOfEvidence: string;
}

export interface StandardizedRadiologyReport {
  examId: string;
  createdAt: string;

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

  // 3. IMPRESSÃO DIAGNÓSTICA
  diagnosticImpression: {
    primaryDiagnosis: string;
    differentialDiagnoses: string[];
    classificationScore?: string;
    comparativeEvolution?: string;
  };

  // 4. REFERÊNCIAS MÉDICAS RESUMIDAS
  medicalLiterature: MedicalCitation[];

  // Assinatura médica do radiologista
  radiologistName?: string;
  crm?: string;
}
