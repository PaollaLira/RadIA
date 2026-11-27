import { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { aiRadiologyEngine } from './services/aiRadiologyEngine';
import { Patient } from './types/patient';
import { UltrasoundExam, UltrasoundSpecialty, TransducerType } from './types/ultrasound';
import { StandardizedRadiologyReport } from './types/report';
import { ChatMessage } from './types/chat';

import { useLanguage } from './i18n/LanguageContext';

import { TopNavBar } from './components/common/TopNavBar';
import { FindingInputArea } from './components/forms/FindingInputArea';
import { UltrasoundViewer } from './components/viewer/UltrasoundViewer';
import { StructuredReportView } from './components/report/StructuredReportView';
import { CameraModal } from './components/camera/CameraModal';
import { DataManagementModal } from './components/modal/DataManagementModal';
import { RadiologyChatbot } from './components/chat/RadiologyChatbot';
import { MeasurementsReferenceView } from './components/measurements/MeasurementsReferenceView';
import { AuthAndPaywallScreen } from './components/auth/AuthAndPaywallScreen';
import { authService } from './services/authService';
import { AuthSession } from './types/auth';

import { Activity, MessageSquare, AlertCircle } from 'lucide-react';

export default function App() {
  const { lang, t } = useLanguage();

  // Dados do storage local
  const [patients, setPatients] = useState<Patient[]>([]);
  const [exams, setExams] = useState<UltrasoundExam[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<StandardizedRadiologyReport | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Autenticação e Assinatura (protótipo local sem backend)
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());
  const [showPaywallUpgrade, setShowPaywallUpgrade] = useState<boolean>(false);

  // Navegação e modais
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'measurements' | 'backup'>('diagnostic');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Estado da Estação de Laudo
  const [inputMode, setInputMode] = useState<'CAMERA_IMAGE' | 'TEXT_FINDING'>('TEXT_FINDING');
  const [patientName, setPatientName] = useState<string>('');
  const [patientCpf, setPatientCpf] = useState<string>('');
  const [patientBirthDate, setPatientBirthDate] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'M' | 'F' | 'Outro'>('F');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<UltrasoundSpecialty | ''>('');
  const [transducer, setTransducer] = useState<TransducerType | ''>('');
  const [findingText, setFindingText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Carregamento inicial do Storage
  useEffect(() => {
    refreshData();
    document.documentElement.classList.add('dark');
  }, []);

  const refreshData = () => {
    const data = storageService.getData();
    setPatients(data.patients);
    setExams(data.exams);

    const patId = data.activePatientId || data.patients[0]?.id || null;
    const exId = data.activeExamId || data.exams[0]?.id || null;

    setActivePatientId(patId);
    setActiveExamId(exId);

    if (exId) {
      loadExamState(exId, patId);
    }
  };

  const loadExamState = (examId: string, patientId?: string | null) => {
    const rawExam = storageService.getExamById(examId);
    if (!rawExam) return;

    const resolvedPatientId = patientId || rawExam.patientId;
    const rawPatient = storageService.getPatientById(resolvedPatientId);

    setActiveExamId(examId);
    setActivePatientId(resolvedPatientId);
    setPatientName(rawPatient?.name || '');
    setPatientCpf(rawPatient?.cpf || '');
    setPatientBirthDate(rawPatient?.birthDate || '');
    setPatientAge(rawPatient?.age && rawPatient.age > 0 ? String(rawPatient.age) : '');
    setPatientGender(rawPatient?.gender || 'F');

    setSpecialty(rawExam.specialty);
    setTransducer(rawExam.transducer);
    setFindingText(rawExam.manualFindingText || '');
    setCapturedImage(rawExam.capturedImageUrl || null);
    setInputMode(rawExam.capturedImageUrl ? 'CAMERA_IMAGE' : 'TEXT_FINDING');
    setAnalysisError(null);

    const report = storageService.getReport(examId);
    setActiveReport(report || null);
    setChatMessages(storageService.getChatHistory(examId));
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const applyImageToActiveExam = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setInputMode('CAMERA_IMAGE');
    setAnalysisError(null);

    const targetExamId = activeExamId || exams[0]?.id || null;
    if (targetExamId) {
      const exam = storageService.getExamById(targetExamId);
      if (exam) {
        exam.capturedImageUrl = imageDataUrl;
        storageService.saveExam(exam);
        setExams(storageService.getExams());
      }
    }
    setActiveTab('diagnostic');
  };

  const handleAnalyzeAndGenerateReport = async () => {
    const rawPatient = patients.find((p) => p.id === activePatientId);
    const currentExam = exams.find((e) => e.id === activeExamId);

    if (!rawPatient || !currentExam) {
      setAnalysisError(t.station.invalidSelectionError);
      return;
    }

    const trimmedPatientName = patientName.trim();
    const trimmedCpf = patientCpf.trim();
    const trimmedBirthDate = patientBirthDate.trim();
    const parsedAge = Number(patientAge);
    const sanitizedAge =
      patientAge.trim() !== '' && Number.isFinite(parsedAge) && parsedAge > 0
        ? Math.min(120, Math.round(parsedAge))
        : 0;
    const hasPatientChanges =
      trimmedPatientName !== rawPatient.name ||
      trimmedCpf !== (rawPatient.cpf || '') ||
      trimmedBirthDate !== (rawPatient.birthDate || '') ||
      sanitizedAge !== rawPatient.age ||
      patientGender !== rawPatient.gender;

    const patientForAnalysis: Patient = hasPatientChanges
      ? {
          ...rawPatient,
          name: trimmedPatientName,
          cpf: trimmedCpf,
          birthDate: trimmedBirthDate,
          age: sanitizedAge,
          gender: patientGender,
        }
      : rawPatient;

    if (hasPatientChanges) {
      storageService.savePatient(patientForAnalysis);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientForAnalysis.id ? patientForAnalysis : p))
      );
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const updatedExam: UltrasoundExam = {
        ...currentExam,
        specialty,
        transducer,
        manualFindingText: findingText,
        capturedImageUrl: capturedImage || undefined,
      };
      storageService.saveExam(updatedExam);

      const report = await aiRadiologyEngine.analyzeExam(updatedExam, patientForAnalysis, {
        inputMode,
        imageDataUrl: capturedImage || undefined,
        customFindingText: findingText,
        language: lang,
      });

      if (session) {
        report.radiologistName = session.name;
        report.crm = session.crm;
      }

      storageService.saveReport(report);
      setActiveReport(report);
      setExams(storageService.getExams());
    } catch (err: unknown) {
      console.error('Erro na análise diagnóstica com UltrAI Med:', err);
      const message =
        err instanceof Error ? err.message : t.station.genericError;
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewBlankReport = () => {
    const now = Date.now();
    const newPatientId = `pat-${now}`;
    const newExamId = `exam-${now}`;

    const newPatient: Patient = {
      id: newPatientId,
      name: '',
      age: 0,
      gender: 'F',
      cpf: '',
      birthDate: '',
    };

    const newExam: UltrasoundExam = {
      id: newExamId,
      patientId: newPatientId,
      specialty: '',
      status: 'PENDING',
      transducer: '',
      manualFindingText: '',
    };

    storageService.savePatient(newPatient);
    storageService.saveExam(newExam);
    storageService.setActiveSelection(newPatientId, newExamId);

    setPatients(storageService.getPatients());
    setExams(storageService.getExams());
    setActivePatientId(newPatientId);
    setActiveExamId(newExamId);
    setPatientName('');
    setPatientCpf('');
    setPatientBirthDate('');
    setPatientAge('');
    setPatientGender('F');
    setSpecialty('');
    setTransducer('');
    setCapturedImage(null);
    setFindingText('');
    setInputMode('TEXT_FINDING');
    setActiveReport(null);
    setChatMessages([]);
    setAnalysisError(null);
    setIsChatOpen(false);
    setActiveTab('diagnostic');
  };

  const handleChatMessagesChange = (nextMessages: ChatMessage[]) => {
    setChatMessages(nextMessages);
    if (activeExamId) {
      storageService.saveChatHistory(activeExamId, nextMessages);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    if (activeExamId) {
      storageService.clearChatHistory(activeExamId);
    }
  };

  const handlePatientNameChange = (nextName: string) => {
    setPatientName(nextName);
    const trimmed = nextName.trim();
    const currentPat = patients.find((p) => p.id === activePatientId) || patients[0];
    if (!currentPat) return;
    const updatedPatient: Patient = {
      ...currentPat,
      name: trimmed,
    };
    storageService.savePatient(updatedPatient);
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handlePatientAgeChange = (nextAge: string) => {
    setPatientAge(nextAge);
    const parsed = Number(nextAge);
    const sanitizedAge =
      nextAge.trim() !== '' && Number.isFinite(parsed) && parsed > 0
        ? Math.min(120, Math.round(parsed))
        : 0;
    const currentPat = patients.find((p) => p.id === activePatientId) || patients[0];
    if (!currentPat) return;
    const updatedPatient: Patient = {
      ...currentPat,
      age: sanitizedAge,
    };
    storageService.savePatient(updatedPatient);
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handlePatientCpfChange = (nextCpf: string) => {
    setPatientCpf(nextCpf);
    const currentPat = patients.find((p) => p.id === activePatientId) || patients[0];
    if (!currentPat) return;
    const updatedPatient: Patient = {
      ...currentPat,
      cpf: nextCpf.trim(),
    };
    storageService.savePatient(updatedPatient);
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handlePatientBirthDateChange = (nextBirthDate: string) => {
    setPatientBirthDate(nextBirthDate);

    let computedAge: number | null = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(nextBirthDate)) {
      const [y, m, d] = nextBirthDate.split('-').map(Number);
      const today = new Date();
      let age = today.getFullYear() - y;
      const monthDiff = today.getMonth() + 1 - m;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
        age--;
      }
      if (age >= 0 && age <= 120) {
        computedAge = age;
        setPatientAge(age > 0 ? String(age) : '');
      }
    }

    const currentPat = patients.find((p) => p.id === activePatientId) || patients[0];
    if (!currentPat) return;
    const updatedPatient: Patient = {
      ...currentPat,
      birthDate: nextBirthDate,
      ...(computedAge !== null ? { age: computedAge } : {}),
    };
    storageService.savePatient(updatedPatient);
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handlePatientGenderChange = (nextGender: 'M' | 'F' | 'Outro') => {
    setPatientGender(nextGender);
    const currentPat = patients.find((p) => p.id === activePatientId) || patients[0];
    if (!currentPat) return;
    const updatedPatient: Patient = {
      ...currentPat,
      gender: nextGender,
    };
    storageService.savePatient(updatedPatient);
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handleSpecialtyChange = (nextSpecialty: UltrasoundSpecialty | '') => {
    setSpecialty(nextSpecialty);
    const targetId = activeExamId || exams[0]?.id;
    const currentEx = targetId ? storageService.getExamById(targetId) : undefined;
    if (!currentEx) return;
    const updatedExam: UltrasoundExam = {
      ...currentEx,
      specialty: nextSpecialty,
    };
    storageService.saveExam(updatedExam);
    setExams(storageService.getExams());
  };

  const handleTransducerChange = (nextTransducer: TransducerType | '') => {
    setTransducer(nextTransducer);
    const targetId = activeExamId || exams[0]?.id;
    const currentEx = targetId ? storageService.getExamById(targetId) : undefined;
    if (!currentEx) return;
    const updatedExam: UltrasoundExam = {
      ...currentEx,
      transducer: nextTransducer,
    };
    storageService.saveExam(updatedExam);
    setExams(storageService.getExams());
  };

  const handleFindingTextChange = (nextText: string) => {
    setFindingText(nextText);
    const targetId = activeExamId || exams[0]?.id;
    const currentEx = targetId ? storageService.getExamById(targetId) : undefined;
    if (!currentEx) return;
    const updatedExam: UltrasoundExam = {
      ...currentEx,
      manualFindingText: nextText,
    };
    storageService.saveExam(updatedExam);
    setExams(storageService.getExams());
  };

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const activeExam = exams.find((e) => e.id === activeExamId) || exams[0];

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    setShowPaywallUpgrade(false);
    setIsChatOpen(false);
    setActiveTab('diagnostic');
  };

  if (!session || showPaywallUpgrade) {
    return (
      <AuthAndPaywallScreen
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        initialMode={showPaywallUpgrade ? 'payment' : 'login'}
        existingSession={session}
        onCancelUpgrade={() => setShowPaywallUpgrade(false)}
        onAuthenticated={(nextSession) => {
          setSession(nextSession);
          setShowPaywallUpgrade(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <TopNavBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'backup') {
            setIsBackupModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onNewExam={handleNewBlankReport}
        session={session}
        onOpenSubscription={() => setShowPaywallUpgrade(true)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'measurements' ? (
          <MeasurementsReferenceView />
        ) : (
          activePatient &&
          activeExam && (
            <div className="space-y-6">
              {/* Split Grid: Visualizador (quando houver imagem) / Formulário & Laudo */}
              <div
              className={
                capturedImage
                  ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
                  : 'max-w-4xl mx-auto space-y-6'
              }
            >
              {/* Coluna Esquerda (somente quando há imagem carregada) */}
              {capturedImage && (
                <div className="lg:col-span-5 space-y-6">
                  <UltrasoundViewer
                    imageUrl={capturedImage}
                    examTitle={`USG ${specialty ? t.specialties[specialty] : lang === 'pt' ? 'Geral' : 'General'} — ${activePatient.name || (lang === 'en' ? 'Patient' : 'Paciente')}`}
                    onRetakeOrUpload={() => setIsCameraOpen(true)}
                  />
                </div>
              )}

              {/* Coluna Principal */}
              <div className={capturedImage ? 'lg:col-span-7 space-y-6' : 'space-y-6'}>
                <FindingInputArea
                  inputMode={inputMode}
                  onChangeInputMode={setInputMode}
                  patientName={patientName}
                  onChangePatientName={handlePatientNameChange}
                  patientCpf={patientCpf}
                  onChangePatientCpf={handlePatientCpfChange}
                  patientBirthDate={patientBirthDate}
                  onChangePatientBirthDate={handlePatientBirthDateChange}
                  patientAge={patientAge}
                  onChangePatientAge={handlePatientAgeChange}
                  patientGender={patientGender}
                  onChangePatientGender={handlePatientGenderChange}
                  specialty={specialty}
                  onChangeSpecialty={handleSpecialtyChange}
                  transducer={transducer}
                  onChangeTransducer={handleTransducerChange}
                  textFinding={findingText}
                  onChangeTextFinding={handleFindingTextChange}
                  hasCapturedImage={!!capturedImage}
                  onOpenLiveCamera={() => setIsCameraOpen(true)}
                  onAnalyze={handleAnalyzeAndGenerateReport}
                  isAnalyzing={isAnalyzing}
                  onOpenChat={() => setIsChatOpen(true)}
                />

                {analysisError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{t.station.analysisErrorTitle}</span>
                      <span>{analysisError}</span>
                    </div>
                  </div>
                )}

                {activeReport ? (
                  <StructuredReportView
                    report={activeReport}
                    patient={activePatient}
                    imageDataUrl={capturedImage}
                    onUpdateReport={(updated) => {
                      storageService.saveReport(updated);
                      setActiveReport(updated);
                    }}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
                    <Activity className="w-8 h-8 text-teal-700 dark:text-cyan-400 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {t.station.awaitingTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      {t.station.awaitingDesc}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          )
        )}
      </main>

      {/* Botão flutuante para abrir o Chatbot quando fechado (apenas na aba de Laudo) */}
      {activeTab === 'diagnostic' && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="no-print fixed bottom-5 right-5 z-40 px-4 py-3 rounded-full bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white shadow-xl flex items-center gap-2 text-xs font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label={t.chat.title}
        >
          <MessageSquare className="w-4 h-4 text-cyan-300" />
          <span>{t.chat.fabLabel}</span>
        </button>
      )}

      {/* Chatbot Radiológico Multi-Turno (Gemini) */}
      <RadiologyChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        patient={activePatient}
        exam={activeExam}
        report={activeReport}
        imageDataUrl={capturedImage}
        messages={chatMessages}
        onMessagesChange={handleChatMessagesChange}
        onClearHistory={handleClearChat}
      />

      {/* Modal da Câmera do Smartphone */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={applyImageToActiveExam}
      />

      {/* Modal de Exportação Clínica e Dados Locais */}
      <DataManagementModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={refreshData}
        patients={patients}
        exams={exams}
        activePatient={activePatient}
        activeExam={activeExam}
        activeReport={activeReport}
        activeImageDataUrl={capturedImage}
      />
    </div>
  );
}
