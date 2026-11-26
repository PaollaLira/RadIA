export interface PriorExam {
  date: string;
  modality: 'USG' | 'TC' | 'RM' | 'MAMOGRAFIA';
  region: string;
  summary: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Outro';
  recordNumber: string; // Número do prontuário
  clinicalIndication: string; // Queixa principal / hipótese diagnóstica
  roomBed?: string;
  priorExams: PriorExam[];
  comorbidities: string[];
  allergies: string[];
  currentMedications: string[];
  renalFunction?: {
    creatinine: number;
    eGFR?: number;
    date: string;
  };
}
