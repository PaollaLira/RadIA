import { Patient } from '../types/patient';
import { UltrasoundExam } from '../types/ultrasound';
import { AppLanguage } from './translations';

const EN_PATIENTS: Record<string, Partial<Patient>> = {
  'pat-001': {
    clinicalIndication:
      'Sudden severe right upper quadrant pain radiating to the back for 12h, fever (38.4°C), vomiting, and leukocytosis (16,200/mm³).',
    roomBed: 'Adult Emergency Room - Bay 04',
    comorbidities: ['Type 2 Diabetes Mellitus', 'Hypertension', 'Dyslipidemia'],
    allergies: ['Dipyrone (bronchospasm)'],
    currentMedications: ['Metformin 850mg BID', 'Losartan 50mg/day'],
    priorExams: [
      {
        id: 'prior-001-a',
        date: '2024-08-15',
        modality: 'USG',
        region: 'Upper Abdomen',
        summary:
          'Moderate hepatic steatosis (Grade II). Gallbladder with mobile microlithiasis, thin walls (2.1 mm), no signs of cholecystitis.',
        keyFindings: ['Grade II hepatic steatosis', 'Biliary microlithiasis without cholecystitis'],
      },
    ],
  },
  'pat-002': {
    clinicalIndication:
      'Painless palpable nodule in the lower third of the right thyroid lobe detected during routine clinical exam.',
    roomBed: 'Outpatient Specialty Clinic - Room 02',
    comorbidities: ['Subclinical hypothyroidism'],
    allergies: ['No known drug allergies'],
    currentMedications: ['Levothyroxine 50 mcg/day fasting'],
    priorExams: [
      {
        id: 'prior-002-a',
        date: '2024-05-10',
        modality: 'USG',
        region: 'Thyroid & Neck',
        summary:
          'Normal thyroid dimensions. Two small colloid cysts in the left lobe (< 3 mm). Homogeneous right lobe without focal nodules.',
        keyFindings: ['Left lobe colloid cysts', 'Normal right lobe without focal lesions'],
      },
    ],
  },
  'pat-003': {
    clinicalIndication:
      'High-speed motorcycle collision polytrauma, diffuse abdominal pain, tachycardia (124 bpm), diaphoresis, BP 85/50 mmHg.',
    roomBed: 'Resuscitation / Shock Bay - Bed 01',
    comorbidities: ['Previously healthy'],
    allergies: ['Unknown (obtunded patient)'],
    currentMedications: ['None'],
  },
  'pat-004': {
    clinicalIndication:
      'Supplemental screening for dense breasts (heterogeneously dense tissue, Type C). Asymptomatic.',
    roomBed: 'Diagnostic Imaging Center',
    comorbidities: ['Osteopenia'],
    allergies: ['Iodinated contrast (prior urticarial reaction)'],
    currentMedications: ['Calcium Carbonate + Vitamin D'],
    priorExams: [
      {
        id: 'prior-004-a',
        date: '2025-10-12',
        modality: 'MAMOGRAFIA',
        region: 'Bilateral Breasts',
        summary:
          'Diffusely dense breasts. No suspicious pleomorphic calcifications or architectural distortion. Supplemental ultrasound recommended.',
        keyFindings: ['Dense breast pattern (Type C)', 'BI-RADS 0 due to density'],
      },
    ],
  },
  'pat-005': {
    clinicalIndication:
      'Sudden severe left renal colic associated with gross hematuria and intractable nausea.',
    roomBed: 'Urgent Care - Bay 08',
    comorbidities: ['Gout', 'Dyslipidemia', 'Benign Prostatic Hyperplasia (BPH)'],
    allergies: ['Sulfa drugs'],
    currentMedications: ['Allopurinol 100mg/day', 'Tamsulosin 0.4mg/day'],
    priorExams: [
      {
        id: 'prior-005-a',
        date: '2023-11-02',
        modality: 'USG',
        region: 'Urinary Tract',
        summary:
          'Normal kidney position and contours. Non-obstructing lower pole microlithiasis on right (3 mm) and left (4 mm). No hydronephrosis.',
        keyFindings: ['Non-obstructing bilateral renal microlithiasis'],
      },
    ],
  },
};

const ES_PATIENTS: Record<string, Partial<Patient>> = {
  'pat-001': {
    clinicalIndication:
      'Dolor súbito intenso en hipocondrio derecho irradiado al dorso desde hace 12 h, fiebre (38,4 °C), vómitos y leucocitosis (16.200/mm³).',
    roomBed: 'Urgencias Adultos - Box 04',
    comorbidities: ['Diabetes Mellitus tipo 2', 'Hipertensión Arterial Sistémica', 'Dislipidemia'],
    allergies: ['Dipirona (broncoespasmo)'],
    currentMedications: ['Metformina 850 mg c/12 h', 'Losartán 50 mg/día'],
    priorExams: [
      {
        id: 'prior-001-a',
        date: '2024-08-15',
        modality: 'USG',
        region: 'Abdomen Superior',
        summary:
          'Esteatosis hepática moderada (grado II). Vesícula biliar con microlitiasis móvil, paredes finas (2,1 mm), sin signos de colecistitis.',
        keyFindings: ['Esteatosis hepática grado II', 'Microlitiasis biliar sin colecistitis'],
      },
    ],
  },
  'pat-002': {
    clinicalIndication:
      'Nódulo palpable indoloro en el tercio inferior del lóbulo tiroideo derecho, detectado en consulta de rutina.',
    roomBed: 'Consulta Externa de Especialidades - Sala 02',
    comorbidities: ['Hipotiroidismo subclínico'],
    allergies: ['Sin alergias medicamentosas conocidas'],
    currentMedications: ['Levotiroxina 50 mcg/día en ayunas'],
    priorExams: [
      {
        id: 'prior-002-a',
        date: '2024-05-10',
        modality: 'USG',
        region: 'Tiroides y Cervical',
        summary:
          'Glándula tiroides de dimensiones conservadas. Dos pequeños quistes coloides en lóbulo izquierdo (< 3 mm). Lóbulo derecho homogéneo sin nódulos focales.',
        keyFindings: ['Quistes coloides en lóbulo izquierdo', 'Lóbulo derecho normal sin lesiones focales'],
      },
    ],
  },
  'pat-003': {
    clinicalIndication:
      'Politraumatismo por colisión de motocicleta, dolor abdominal difuso, taquicardia (124 lpm), diaforesis fría, PA 85/50 mmHg.',
    roomBed: 'Sala de Choque / Reanimación - Cama 01',
    comorbidities: ['Previamente sano'],
    allergies: ['Desconocidas (paciente obnubilado)'],
    currentMedications: ['Ninguna'],
  },
  'pat-004': {
    clinicalIndication:
      'Tamizaje complementario por mamas densas (patrón heterogéneamente denso, Tipo C). Asintomática.',
    roomBed: 'Centro de Diagnóstico por Imagen',
    comorbidities: ['Osteopenia'],
    allergies: ['Contraste yodado (reacción urticariforme previa)'],
    currentMedications: ['Carbonato de Calcio + Vitamina D'],
    priorExams: [
      {
        id: 'prior-004-a',
        date: '2025-10-12',
        modality: 'MAMOGRAFIA',
        region: 'Mamas Bilateral',
        summary:
          'Mamas difusamente densas. Sin microcalcificaciones pleomórficas sospechosas ni distorsión arquitectural. Se sugiere ultrasonido complementario.',
        keyFindings: ['Patrón mamario denso (Tipo C)', 'BI-RADS 0 por densidad'],
      },
    ],
  },
  'pat-005': {
    clinicalIndication:
      'Cólico nefrítico izquierdo súbito de gran intensidad asociado a hematuria macroscópica y náuseas incoercibles.',
    roomBed: 'Urgencias - Box 08',
    comorbidities: ['Gota', 'Dislipidemia', 'Hiperplasia Prostática Benigna (HPB)'],
    allergies: ['Sulfamidas'],
    currentMedications: ['Alopurinol 100 mg/día', 'Tamsulosina 0,4 mg/día'],
    priorExams: [
      {
        id: 'prior-005-a',
        date: '2023-11-02',
        modality: 'USG',
        region: 'Aparato Urinario',
        summary:
          'Riñones tópicos con contornos conservados. Microlitiasis no obstructiva en polo inferior derecho (3 mm) e izquierdo (4 mm). Sin hidronefrosis.',
        keyFindings: ['Microlitiasis renal bilateral no obstructiva'],
      },
    ],
  },
};

const EN_EXAM_FINDINGS: Record<string, string> = {
  'exam-001':
    'Distended gallbladder with a 19 mm calculus impacted at the infundibulum showing posterior acoustic shadowing. Thickened wall measuring 5.4 mm with hypoechoic mural halo and pericholecystic fluid. Positive sonographic Murphy sign.',
  'exam-002':
    'Markedly hypoechoic solid nodule in the mid right thyroid lobe measuring 15 x 11 x 13 mm. Taller-than-wide orientation, microlobulated margins, and punctate echogenic foci (microcalcifications).',
  'exam-003':
    'E-FAST Trauma: Free anechoic fluid stripe in the hepatorenal recess / Morison pouch (16 mm thickness) and splenorenal recess. Pericardial window clear; bilateral lung sliding preserved.',
  'exam-004':
    'Oval, circumscribed anechoic cyst with thin walls and crisp posterior acoustic enhancement in the upper outer quadrant of the left breast (2 o’clock), measuring 8 x 5 mm. No internal Doppler flow.',
  'exam-005':
    'Moderate-to-severe left pelvicalyceal ectasia. Hyperechoic 8 mm calculus in the distal left ureter / ureterovesical junction producing posterior acoustic shadowing and twinkling artifact.',
};

const ES_EXAM_FINDINGS: Record<string, string> = {
  'exam-001':
    'Vesícula biliar distendida con cálculo de 19 mm impactado en el infundíbulo con sombra acústica posterior. Pared engrosada de 5,4 mm con halo mural hipoecogénico y líquido pericolecístico. Signo de Murphy ecográfico positivo.',
  'exam-002':
    'Nódulo sólido marcadamente hipoecogénico en el tercio medio del lóbulo tiroideo derecho de 15 x 11 x 13 mm. Orientación más alta que ancha, márgenes microlobulados y focos ecogénicos puntiformes (microcalcificaciones).',
  'exam-003':
    'E-FAST Trauma: Lámina de líquido libre anecoico en el receso hepatorrenal / espacio de Morrison (16 mm de espesor) y en el receso esplenorrenal. Ventana pericárdica libre y deslizamiento pleural conservado bilateralmente.',
  'exam-004':
    'Quiste anecoico ovalado y circunscrito, de paredes finas y nítido refuerzo acústico posterior en el cuadrante superior externo de la mama izquierda (radio 2 h), de 8 x 5 mm. Sin vascularización al Doppler.',
  'exam-005':
    'Ectasia pielocalicial izquierda moderada a grave. Cálculo hiperecogénico de 8 mm en el uréter distal izquierdo / unión ureterovesical que produce sombra acústica posterior y artefacto de centelleo.',
};

export function localizePatient(patient: Patient, lang: AppLanguage): Patient {
  if (lang === 'pt') return patient;
  const patch = lang === 'es' ? ES_PATIENTS[patient.id] : EN_PATIENTS[patient.id];
  if (!patch) return patient;
  return {
    ...patient,
    ...patch,
  };
}

export function localizeExam(exam: UltrasoundExam, lang: AppLanguage): UltrasoundExam {
  if (lang === 'pt') return exam;
  const localizedFinding =
    lang === 'es' ? ES_EXAM_FINDINGS[exam.id] : EN_EXAM_FINDINGS[exam.id];
  if (!localizedFinding) return exam;
  return {
    ...exam,
    manualFindingText: localizedFinding,
  };
}
