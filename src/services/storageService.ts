import { Patient } from '../types/patient';
import { UltrasoundExam } from '../types/ultrasound';
import { StandardizedRadiologyReport } from '../types/report';
import { ChatMessage } from '../types/chat';

interface StorageData {
  patients: Patient[];
  exams: UltrasoundExam[];
  reports: Record<string, StandardizedRadiologyReport>; // examId -> Report
  chatHistories?: Record<string, ChatMessage[]>; // examId -> ChatMessage[]
  activePatientId: string | null;
  activeExamId: string | null;
}

const STORAGE_KEY = 'ultrai_med_clinical_store_v2';

function createInitialState(): StorageData {
  const initialPatient: Patient = {
    id: 'pat-initial',
    name: '',
    age: 0,
    gender: 'F',
    cpf: '',
    birthDate: '',
  };

  const initialExam: UltrasoundExam = {
    id: 'exam-initial',
    patientId: 'pat-initial',
    specialty: '',
    status: 'PENDING',
    transducer: '',
    manualFindingText: '',
  };

  return {
    patients: [initialPatient],
    exams: [initialExam],
    reports: {},
    activePatientId: initialPatient.id,
    activeExamId: initialExam.id,
  };
}

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  public getData(): StorageData {
    if (!this.isBrowser()) {
      return createInitialState();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initialData = createInitialState();
        this.saveData(initialData);
        return initialData;
      }
      return JSON.parse(stored) as StorageData;
    } catch (err) {
      console.warn('Erro ao carregar dados do localStorage, redefinindo:', err);
      return createInitialState();
    }
  }

  private saveData(data: StorageData): void {
    if (!this.isBrowser()) return;

    const tryPersist = (payload: StorageData): boolean => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    };

    // Proactively prune heavy base64 images from older non-active exams if >2 images exist
    let imageCount = 0;
    const trimmedExams = data.exams.map((exam) => {
      if (!exam.capturedImageUrl) return exam;
      if (exam.id === data.activeExamId) return exam;
      imageCount += 1;
      if (imageCount > 2) {
        const { capturedImageUrl: _dropped, ...rest } = exam;
        return rest;
      }
      return exam;
    });

    const candidate: StorageData = { ...data, exams: trimmedExams };
    if (tryPersist(candidate)) return;

    // Fallback 1: drop capturedImageUrl from all non-active exams
    const activeOnlyImages: StorageData = {
      ...data,
      exams: data.exams.map((exam) => {
        if (exam.id === data.activeExamId || !exam.capturedImageUrl) return exam;
        const { capturedImageUrl: _dropped, ...rest } = exam;
        return rest;
      }),
    };
    if (tryPersist(activeOnlyImages)) return;

    // Fallback 2: drop all capturedImageUrl payloads so patient/exam/report text still saves safely
    const noImages: StorageData = {
      ...data,
      exams: data.exams.map((exam) => {
        if (!exam.capturedImageUrl) return exam;
        const { capturedImageUrl: _dropped, ...rest } = exam;
        return rest;
      }),
    };
    if (!tryPersist(noImages)) {
      console.error('Falha ao salvar no localStorage mesmo após compactação.');
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

  public setActiveSelection(patientId: string, examId: string): void {
    const data = this.getData();
    data.activePatientId = patientId;
    data.activeExamId = examId;
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

  public resetToDefaults(): void {
    this.saveData(createInitialState());
  }
}

export const storageService = new StorageService();
