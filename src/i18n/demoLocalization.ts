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

export function localizePatient(patient: Patient, lang: AppLanguage): Patient {
  if (lang === 'pt') return patient;
  const patch = EN_PATIENTS[patient.id];
  if (!patch) return patient;
  return {
    ...patient,
    ...patch,
  };
}

export function localizeExam(exam: UltrasoundExam, lang: AppLanguage): UltrasoundExam {
  if (lang === 'pt') return exam;
  const enFinding = EN_EXAM_FINDINGS[exam.id];
  if (!enFinding) return exam;
  return {
    ...exam,
    manualFindingText: enFinding,
  };
}
