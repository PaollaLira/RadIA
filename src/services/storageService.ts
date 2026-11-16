import { Patient } from '../types/patient';
import { UltrasoundExam } from '../types/ultrasound';
import { StandardizedRadiologyReport } from '../types/report';
import { ChatMessage } from '../types/chat';

export interface StorageData {
  patients: Patient[];
  exams: UltrasoundExam[];
  reports: Record<string, StandardizedRadiologyReport>; // examId -> Report
  chatHistories?: Record<string, ChatMessage[]>; // examId -> ChatMessage[]
  activePatientId: string | null;
  activeExamId: string | null;
}

const STORAGE_KEY = 'radia_clinical_store_v1';

// Casos clínicos pré-configurados de ultrassonografia com histórico rico
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-001',
    name: 'Roberto Carlos Silveira',
    age: 58,
    gender: 'M',
    recordNumber: 'HC-2026-9081',
    clinicalIndication: 'Dor súbita intensa em hipocôndrio direito irradiada para dorso há 12h, febre (38.4°C), vômitos e leucocitose (16.200/mm³).',
    admissionDate: '2026-11-10 08:30',
    roomBed: 'Pronto-Socorro Adulto - Leito 04',
    comorbidities: ['Diabetes Mellitus tipo 2', 'Hipertensão Arterial Sistêmica', 'Dislipidemia'],
    allergies: ['Dipirona (broncoespasmo)'],
    currentMedications: ['Metformina 850mg 2x/dia', 'Losartana 50mg/dia'],
    renalFunction: {
      creatinine: 1.1,
      eGFR: 78,
      date: '2026-11-10',
    },
    priorExams: [
      {
        id: 'prior-001-a',
        date: '2024-08-15',
        modality: 'USG',
        region: 'Abdome Superior',
        summary: 'Esteatose hepática moderada (grau II). Vesícula biliar contendo microlitíase móvel, paredes finas (2.1 mm), sem sinais de colecistite.',
        keyFindings: ['Esteatose hepática grau II', 'Microlitíase biliar sem colecistite'],
      },
    ],
  },
  {
    id: 'pat-002',
    name: 'Helena Maria Vasconcelos',
    age: 42,
    gender: 'F',
    recordNumber: 'HC-2026-7412',
    clinicalIndication: 'Nódulo palpável indolor em terço inferior do lobo tireoidiano direito, detectado em consulta ginecológica.',
    admissionDate: '2026-11-09 14:15',
    roomBed: 'Ambulatório de Especialidades - Sala 02',
    comorbidities: ['Hipotireoidismo subclínico'],
    allergies: ['Sem alergias medicamentosas relatadas'],
    currentMedications: ['Levotiroxina 50 mcg/dia em jejum'],
    renalFunction: {
      creatinine: 0.8,
      eGFR: 95,
      date: '2026-09-18',
    },
    priorExams: [
      {
        id: 'prior-002-a',
        date: '2024-05-10',
        modality: 'USG',
        region: 'Tireoide e Cervical',
        summary: 'Glândula tireoide de dimensões anatômicas. Presença de dois pequenos cistos coloides em lobo esquerdo (< 3 mm). Lobo direito homogêneo sem nódulos identificáveis.',
        keyFindings: ['Cistos coloides em lobo esquerdo', 'Lobo direito normal sem lesões focais'],
      },
    ],
  },
  {
    id: 'pat-003',
    name: 'Lucas Gabriel Mendes',
    age: 26,
    gender: 'M',
    recordNumber: 'HC-2026-3190',
    clinicalIndication: 'Politrauma por colisão moto x anteparo, dor abdominal difusa, taquicardia (124 bpm), sudorese fria, PA 85/50 mmHg.',
    admissionDate: '2026-11-10 10:45',
    roomBed: 'Sala Vermelha / Choque - Leito 01',
    comorbidities: ['Hígido previamente'],
    allergies: ['Não informadas (paciente torporoso)'],
    currentMedications: ['Nenhuma de uso contínuo'],
    priorExams: [],
  },
  {
    id: 'pat-004',
    name: 'Carmem Lúcia Ferreira',
    age: 54,
    gender: 'F',
    recordNumber: 'HC-2026-1184',
    clinicalIndication: 'Rastreamento de mamas densas (composição mamográfica heterogênea tipo C). Assintomática.',
    admissionDate: '2026-11-08 11:00',
    roomBed: 'Centro de Diagnóstico por Imagem',
    comorbidities: ['Osteopenia'],
    allergies: ['Iodo (reação urticariforme prévia)'],
    currentMedications: ['Carbonato de Cálcio + Vitamina D'],
    priorExams: [
      {
        id: 'prior-004-a',
        date: '2025-10-12',
        modality: 'MAMOGRAFIA',
        region: 'Mamas Bilateral',
        summary: 'Mamas densas de distribuição difusa. Sem calcificações pleomórficas suspeitas ou distorções arquiteturais. Sugerida complementação ultrassonográfica.',
        keyFindings: ['Padrão de alta densidade mamária (Tipo C)', 'BI-RADS 0 por densidade'],
      },
    ],
  },
  {
    id: 'pat-005',
    name: 'Valdir Antunes Pereira',
    age: 67,
    gender: 'M',
    recordNumber: 'HC-2026-8854',
    clinicalIndication: 'Cólica nefrética súbita à esquerda de forte intensidade, associada a hematúria macroscópica e náuseas incoercíveis.',
    admissionDate: '2026-11-10 07:15',
    roomBed: 'Pronto Atendimento - Box 08',
    comorbidities: ['Gota úrica', 'Dislipidemia', 'Hiperplasia Prostática Benigna (HPB)'],
    allergies: ['Sulfa'],
    currentMedications: ['Alopurinol 100mg/dia', 'Tansulosina 0.4mg/dia'],
    renalFunction: {
      creatinine: 1.4,
      eGFR: 52,
      date: '2026-11-10',
    },
    priorExams: [
      {
        id: 'prior-005-a',
        date: '2023-11-02',
        modality: 'USG',
        region: 'Aparelho Urinário',
        summary: 'Rins tópicos com limites conservados. Microlitíases não obstrutivas em cálice inferior direito (3 mm) e esquerdo (4 mm). Ausência de hidronefrose à época.',
        keyFindings: ['Microlitíase renal bilateral não obstrutiva'],
      },
    ],
  },
];

export const INITIAL_EXAMS: UltrasoundExam[] = [
  {
    id: 'exam-001',
    patientId: 'pat-001',
    specialty: 'ABDOMEN',
    urgency: 'URGENT',
    status: 'IN_PROGRESS',
    transducer: 'CONVEX',
    manualFindingText: 'Vesícula biliar distendida, cálculo impactado no infundíbulo medindo 19 mm com sombra acústica posterior. Parede espessada medindo 5.4 mm com halo hipoecogênico e líquido pericolecístico. Sinal de Murphy ultrassonográfico positivo.',
    createdAt: '2026-11-10 08:45',
    updatedAt: '2026-11-10 09:00',
  },
  {
    id: 'exam-002',
    patientId: 'pat-002',
    specialty: 'THYROID',
    urgency: 'PRIORITY',
    status: 'PENDING',
    transducer: 'LINEAR',
    manualFindingText: 'Nódulo sólido marcadamente hipoecoico em terço médio do lobo direito da tireoide, medindo 15 x 11 x 13 mm. Relação mais alto que largo, margens microlobuladas e microcalcificações internas puntiformes.',
    createdAt: '2026-11-09 14:30',
    updatedAt: '2026-11-09 14:30',
  },
  {
    id: 'exam-003',
    patientId: 'pat-003',
    specialty: 'POCUS_FAST',
    urgency: 'EMERGENCY',
    status: 'IN_PROGRESS',
    transducer: 'SECTOR',
    manualFindingText: 'E-FAST Trauma: Lâmina líquida anecoica franca em recesso hepatorrenal de Morrison (espessura 16 mm) e lâmina em recesso esplenorrenal. Janela pericárdica livre e deslizamento pleural preservado bilateralmente.',
    createdAt: '2026-11-10 10:50',
    updatedAt: '2026-11-10 10:52',
  },
  {
    id: 'exam-004',
    patientId: 'pat-004',
    specialty: 'BREAST',
    urgency: 'ELECTIVE',
    status: 'REPORTED',
    transducer: 'LINEAR',
    manualFindingText: 'Nódulo anecoico oval, circunscrito, de paredes finas, reforço acústico posterior límpido, no quadrante superior externo da mama esquerda (posição 2h), medindo 8 x 5 mm. Sem vascularização ao Doppler.',
    createdAt: '2026-11-08 11:15',
    updatedAt: '2026-11-08 11:40',
  },
  {
    id: 'exam-005',
    patientId: 'pat-005',
    specialty: 'URINARY_KIDNEYS',
    urgency: 'URGENT',
    status: 'PENDING',
    transducer: 'CONVEX',
    manualFindingText: 'Moderada a importante ectasia pielocalicinal no rim esquerdo. Imagem hiperecogênica com 8 mm no terço distal do ureter esquerdo / junção ureterovesical, produzindo sombra acústica e artefato de cintilação.',
    createdAt: '2026-11-10 07:30',
    updatedAt: '2026-11-10 07:30',
  },
];

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  public getData(): StorageData {
    if (!this.isBrowser()) {
      return {
        patients: INITIAL_PATIENTS,
        exams: INITIAL_EXAMS,
        reports: {},
        activePatientId: 'pat-001',
        activeExamId: 'exam-001',
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initialData: StorageData = {
          patients: INITIAL_PATIENTS,
          exams: INITIAL_EXAMS,
          reports: {},
          activePatientId: 'pat-001',
          activeExamId: 'exam-001',
        };
        this.saveData(initialData);
        return initialData;
      }
      return JSON.parse(stored) as StorageData;
    } catch (err) {
      console.warn('Erro ao carregar dados do localStorage, redefinindo:', err);
      return {
        patients: INITIAL_PATIENTS,
        exams: INITIAL_EXAMS,
        reports: {},
        activePatientId: 'pat-001',
        activeExamId: 'exam-001',
      };
    }
  }

  public saveData(data: StorageData): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Falha ao salvar no localStorage:', err);
    }
  }

  public getPatients(): Patient[] {
    return this.getData().patients;
  }

  public getPatientById(id: string): Patient | undefined {
    return this.getData().patients.find((p) => p.id === id);
  }

  public savePatient(patient: Patient): void {
    const data = this.getData();
    const index = data.patients.findIndex((p) => p.id === patient.id);
    if (index >= 0) {
      data.patients[index] = patient;
    } else {
      data.patients.unshift(patient);
    }
    this.saveData(data);
  }

  public getExams(): UltrasoundExam[] {
    return this.getData().exams;
  }

  public getExamById(id: string): UltrasoundExam | undefined {
    return this.getData().exams.find((e) => e.id === id);
  }

  public getExamsForPatient(patientId: string): UltrasoundExam[] {
    return this.getData().exams.filter((e) => e.patientId === patientId);
  }

  public saveExam(exam: UltrasoundExam): void {
    const data = this.getData();
    const index = data.exams.findIndex((e) => e.id === exam.id);
    if (index >= 0) {
      data.exams[index] = exam;
    } else {
      data.exams.unshift(exam);
    }
    this.saveData(data);
  }

  public getReport(examId: string): StandardizedRadiologyReport | undefined {
    return this.getData().reports[examId];
  }

  public saveReport(report: StandardizedRadiologyReport): void {
    const data = this.getData();
    data.reports[report.examId] = report;
    // Marca o exame como concluído ou atualizado
    const exam = data.exams.find((e) => e.id === report.examId);
    if (exam) {
      exam.status = 'REPORTED';
      exam.urgency = report.urgencyLevel;
      exam.updatedAt = new Date().toISOString();
    }
    this.saveData(data);
  }

  public getChatHistory(examId: string): ChatMessage[] {
    const data = this.getData();
    return data.chatHistories?.[examId] || [];
  }

  public saveChatHistory(examId: string, messages: ChatMessage[]): void {
    const data = this.getData();
    if (!data.chatHistories) {
      data.chatHistories = {};
    }
    data.chatHistories[examId] = messages;
    this.saveData(data);
  }

  public clearChatHistory(examId: string): void {
    const data = this.getData();
    if (data.chatHistories) {
      delete data.chatHistories[examId];
      this.saveData(data);
    }
  }

  public exportBackupJson(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  public importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as StorageData;
      if (Array.isArray(parsed.patients) && Array.isArray(parsed.exams)) {
        this.saveData(parsed);
        return true;
      }
      return false;
    } catch (err) {
      console.error('JSON de backup inválido:', err);
      return false;
    }
  }

  public resetToDefaults(): void {
    const initialData: StorageData = {
      patients: INITIAL_PATIENTS,
      exams: INITIAL_EXAMS,
      reports: {},
      activePatientId: 'pat-001',
      activeExamId: 'exam-001',
    };
    this.saveData(initialData);
  }
}

export const storageService = new StorageService();
