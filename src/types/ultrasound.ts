export type UltrasoundSpecialty =
  | 'ABDOMEN'           // Abdome Total / Superior / Hipocôndrio
  | 'THYROID'           // Tireoide e Cervical (TI-RADS)
  | 'BREAST'            // Mamas (BI-RADS USG)
  | 'URINARY_KIDNEYS'   // Rins e Vias Urinárias
  | 'POCUS_FAST'        // POCUS / E-FAST no Trauma e Urgência
  | 'PELVIC_GYN'        // Pélvico / Ginecológico / Transvaginal
  | 'VASCULAR_DOPPLER'; // Doppler Vascular Periférico / Carótidas

export type TransducerType = 'CONVEX' | 'LINEAR' | 'SECTOR' | 'ENDOCAVITARY';

export interface UltrasoundPreset {
  id: UltrasoundSpecialty;
  name: string;
  shortName: string;
  defaultTransducer: TransducerType;
  commonIndications: string[];
  referenceClassification?: string; // ex: ACR TI-RADS, BI-RADS USG, Bosniak
  typicalFindingsShortcuts: string[];
}

export interface UltrasoundExam {
  id: string;
  patientId: string;
  specialty: UltrasoundSpecialty | '';
  urgency: 'EMERGENCY' | 'URGENT' | 'PRIORITY' | 'ELECTIVE';
  status: 'PENDING' | 'IN_PROGRESS' | 'REPORTED';
  transducer: TransducerType | '';
  capturedImageUrl?: string;
  manualFindingText?: string;
  createdAt: string;
  updatedAt: string;
}
