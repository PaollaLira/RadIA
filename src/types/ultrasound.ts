export type UltrasoundSpecialty =
  | 'ABDOMEN'                     // Abdome Total / Superior
  | 'CERVICAL'                    // Cervical (Linfonodos / Glândulas Salivares / Pescoço)
  | 'THYROID'                     // Tireoide (TI-RADS)
  | 'BREAST'                      // Mamas (BI-RADS USG)
  | 'AXILLAE'                     // Axilas
  | 'URINARY_KIDNEYS'             // Rins e Vias Urinárias
  | 'POCUS_FAST'                  // POCUS / E-FAST Trauma
  | 'PELVIC_GYN'                  // Pélvico / Ginecológico
  | 'OBSTETRIC_INITIAL'           // Obstétrico Inicial (1º Trimestre)
  | 'OBSTETRIC_SECOND_TRIMESTER'  // Obstétrico Segundo Trimestre
  | 'OBSTETRIC_THIRD_TRIMESTER'   // Obstétrico Terceiro Trimestre
  | 'VASCULAR_DOPPLER'            // Doppler Vascular
  | 'SOFT_TISSUES'                // Partes Moles
  | 'MSK_WRIST'                   // Músculo-Esquelético - Punho
  | 'MSK_HAND'                    // Músculo-Esquelético - Mão
  | 'MSK_FOOT'                    // Músculo-Esquelético - Pé
  | 'MSK_SHOULDER'                // Músculo-Esquelético - Ombro
  | 'MSK_ANKLE'                   // Músculo-Esquelético - Tornozelo
  | 'MSK_HIP'                     // Músculo-Esquelético - Quadril
  | 'MSK_KNEE'                    // Músculo-Esquelético - Joelho
  | 'MSK_ELBOW'                   // Músculo-Esquelético - Cotovelo
  | 'MSK_ARM'                     // Músculo-Esquelético - Braço
  | 'MSK_FOREARM'                 // Músculo-Esquelético - Antebraço
  | 'MSK_THIGH'                   // Músculo-Esquelético - Coxa
  | 'MSK_LEG';                    // Músculo-Esquelético - Perna

export type TransducerType = 'CONVEX' | 'LINEAR' | 'SECTOR' | 'ENDOCAVITARY';

export interface UltrasoundExam {
  id: string;
  patientId: string;
  specialty: UltrasoundSpecialty | '';
  status: 'PENDING' | 'IN_PROGRESS' | 'REPORTED';
  transducer: TransducerType | '';
  capturedImageUrl?: string;
  manualFindingText?: string;
}
