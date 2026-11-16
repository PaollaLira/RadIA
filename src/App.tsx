import React, { useState, useEffect, useRef } from 'react';
import { storageService } from './services/storageService';
import { aiRadiologyEngine } from './services/aiRadiologyEngine';
import { Patient } from './types/patient';
import { UltrasoundExam, UltrasoundSpecialty, TransducerType } from './types/ultrasound';
import { StandardizedRadiologyReport } from './types/report';
import { ChatMessage } from './types/chat';

import { useLanguage } from './i18n/LanguageContext';
import { localizePatient, localizeExam } from './i18n/demoLocalization';

import { TopNavBar } from './components/common/TopNavBar';
import { WorklistQueue } from './components/worklist/WorklistQueue';
import { PatientHistoryCard } from './components/worklist/PatientHistoryCard';
import { FindingInputArea } from './components/forms/FindingInputArea';
import { UltrasoundViewer } from './components/viewer/UltrasoundViewer';
import { StructuredReportView } from './components/report/StructuredReportView';
import { CameraModal } from './components/camera/CameraModal';
import { NewPatientExamModal } from './components/modal/NewPatientExamModal';
import { DataManagementModal } from './components/modal/DataManagementModal';
import { RadiologyChatbot } from './components/chat/RadiologyChatbot';

import { Activity, Camera, Upload, MessageSquare, AlertCircle } from 'lucide-react';

export default function App() {
  const { lang, t } = useLanguage();

  // Dados do storage local
  const [patients, setPatients] = useState<Patient[]>([]);
  const [exams, setExams] = useState<UltrasoundExam[]>([]);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<StandardizedRadiologyReport | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Navegação e modais
  const [activeTab, setActiveTab] = useState<'worklist' | 'diagnostic' | 'backup'>('worklist');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isNewExamModalOpen, setIsNewExamModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Estado da Estação de Laudo
  const [inputMode, setInputMode] = useState<'CAMERA_IMAGE' | 'TEXT_FINDING'>('TEXT_FINDING');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<UltrasoundSpecialty>('ABDOMEN');
  const [transducer, setTransducer] = useState<TransducerType>('CONVEX');
  const [findingText, setFindingText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const inlineUploadRef = useRef<HTMLInputElement>(null);

  // Carregamento inicial do Storage
  useEffect(() => {
    refreshData();
    document.documentElement.classList.add('dark');
  }, []);

  // Sincroniza achado de casos de demonstração quando usuário troca idioma
  useEffect(() => {
    if (!activeExamId) return;
    const rawExam = storageService.getExamById(activeExamId);
    if (!rawExam) return;
    const ptDefault = rawExam.manualFindingText || '';
    const enLocalized = localizeExam(rawExam, 'en').manualFindingText || '';
    // Só substitui se o texto atual corresponder exatamente ao texto padrão em PT ou EN (preserva edições customizadas)
    if (findingText === ptDefault || findingText === enLocalized) {
      setFindingText(localizeExam(rawExam, lang).manualFindingText || '');
    }
  }, [lang, activeExamId]);

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

    const localized = localizeExam(rawExam, lang);

    setActiveExamId(examId);
    setActivePatientId(patientId || rawExam.patientId);

    setSpecialty(rawExam.specialty);
    setTransducer(rawExam.transducer);
    setFindingText(localized.manualFindingText || '');
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

  const handleSelectExam = (examId: string, patientId: string) => {
    loadExamState(examId, patientId);
    setActiveTab('diagnostic');
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
        exam.updatedAt = new Date().toISOString();
        storageService.saveExam(exam);
        setExams(storageService.getExams());
      }
    }
    setActiveTab('diagnostic');
  };

  const handleInlineFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        applyImageToActiveExam(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyzeAndGenerateReport = async () => {
    const rawPatient = patients.find((p) => p.id === activePatientId);
    const currentExam = exams.find((e) => e.id === activeExamId);

    if (!rawPatient || !currentExam) {
      setAnalysisError(t.station.invalidSelectionError);
      return;
    }

    const localizedPatientForAi = localizePatient(rawPatient, lang);

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const updatedExam: UltrasoundExam = {
        ...currentExam,
        specialty,
        transducer,
        manualFindingText: findingText,
        capturedImageUrl: capturedImage || undefined,
        updatedAt: new Date().toISOString(),
      };
      storageService.saveExam(updatedExam);

      const report = await aiRadiologyEngine.analyzeExam(updatedExam, localizedPatientForAi, {
        inputMode,
        imageDataUrl: capturedImage || undefined,
        customFindingText: findingText,
        language: lang,
      });

      storageService.saveReport(report);
      setActiveReport(report);
      setExams(storageService.getExams());
    } catch (err: unknown) {
      console.error('Erro na análise diagnóstica com RadIA:', err);
      const message =
        err instanceof Error ? err.message : t.station.genericError;
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveNewPatient = (newPatient: Patient, newExam: UltrasoundExam) => {
    storageService.savePatient(newPatient);
    storageService.saveExam(newExam);
    refreshData();
    loadExamState(newExam.id, newPatient.id);
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

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const activeExam = exams.find((e) => e.id === activeExamId) || exams[0];
  const localizedActivePatient = activePatient ? localizePatient(activePatient, lang) : undefined;

  const pendingCount = exams.filter((e) => e.status !== 'REPORTED').length;
  const emergencyCount = exams.filter((e) => e.urgency === 'EMERGENCY' || e.urgency === 'URGENT').length;

  const activeGenderLabel = localizedActivePatient
    ? localizedActivePatient.gender === 'M'
      ? t.patientCard.male
      : localizedActivePatient.gender === 'F'
        ? t.patientCard.female
        : t.patientCard.other
    : '';

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
        pendingCount={pendingCount}
        emergencyCount={emergencyCount}
        onNewExam={() => setIsNewExamModalOpen(true)}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* VIEW 1: Worklist de Triagem */}
        {activeTab === 'worklist' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <WorklistQueue
                patients={patients}
                exams={exams}
                activeExamId={activeExamId}
                onSelectExam={handleSelectExam}
                onNewExam={() => setIsNewExamModalOpen(true)}
              />
            </div>

            <div className="lg:col-span-4 space-y-4">
              {activePatient ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                      {t.worklist.activeRecord}
                    </span>
                    <button
                      onClick={() => setActiveTab('diagnostic')}
                      className="text-xs font-semibold text-teal-700 dark:text-cyan-400 hover:underline"
                    >
                      {t.worklist.openStation}
                    </button>
                  </div>
                  <PatientHistoryCard patient={activePatient} />
                </>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
                  {t.worklist.selectPrompt}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Estação de Trabalho Radiológica */}
        {activeTab === 'diagnostic' && localizedActivePatient && activeExam && (
          <div className="space-y-6">
            {/* Top Patient Strip & Quick Switch */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-800 dark:bg-teal-700 text-cyan-300 flex items-center justify-center font-bold text-sm">
                  USG
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      {localizedActivePatient.name}
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">
                      ({localizedActivePatient.recordNumber})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>
                      {localizedActivePatient.age} {t.patientCard.years} · {activeGenderLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-teal-800 dark:text-cyan-400">
                      {t.station.examLabel}: {t.specialties[specialty]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-teal-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.station.discussRadia}</span>
                </button>
                <button
                  onClick={() => setActiveTab('worklist')}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {t.station.changePatient}
                </button>
              </div>
            </div>

            {/* Split Grid: Histórico & Visualizador / Formulário & Laudo */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Coluna Esquerda */}
              <div className="lg:col-span-5 space-y-6">
                {capturedImage ? (
                  <UltrasoundViewer
                    imageUrl={capturedImage}
                    examTitle={`USG ${t.specialties[specialty]} — ${localizedActivePatient.name}`}
                    onRetakeOrUpload={() => setIsCameraOpen(true)}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center space-y-3">
                    <input
                      ref={inlineUploadRef}
                      type="file"
                      accept="image/*"
                      onChange={handleInlineFileUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {t.station.noImageTitle}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mt-1">
                        {t.station.noImageDesc}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => inlineUploadRef.current?.click()}
                        className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                      >
                        <Upload className="w-4 h-4 text-teal-700 dark:text-cyan-400" />
                        <span>{t.station.uploadDevice}</span>
                      </button>
                      <button
                        onClick={() => setIsCameraOpen(true)}
                        className="px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{t.station.openCamera}</span>
                      </button>
                    </div>
                  </div>
                )}

                <PatientHistoryCard patient={localizedActivePatient} />
              </div>

              {/* Coluna Direita */}
              <div className="lg:col-span-7 space-y-6">
                <FindingInputArea
                  inputMode={inputMode}
                  onChangeInputMode={setInputMode}
                  specialty={specialty}
                  onChangeSpecialty={setSpecialty}
                  transducer={transducer}
                  onChangeTransducer={setTransducer}
                  textFinding={findingText}
                  onChangeTextFinding={setFindingText}
                  hasCapturedImage={!!capturedImage}
                  onOpenLiveCamera={() => setIsCameraOpen(true)}
                  onAnalyze={handleAnalyzeAndGenerateReport}
                  isAnalyzing={isAnalyzing}
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
                    patient={localizedActivePatient}
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
        )}
      </main>

      {/* Botão flutuante para abrir o Chatbot quando fechado */}
      {!isChatOpen && (
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
        patient={localizedActivePatient}
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

      {/* Modal de Cadastro de Novo Paciente / Exame */}
      <NewPatientExamModal
        isOpen={isNewExamModalOpen}
        onClose={() => setIsNewExamModalOpen(false)}
        onSave={handleSaveNewPatient}
      />

      {/* Modal de Exportação Clínica e Dados Locais */}
      <DataManagementModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={refreshData}
        patients={patients}
        exams={exams}
        activePatient={localizedActivePatient}
        activeExam={activeExam}
        activeReport={activeReport}
        activeImageDataUrl={capturedImage}
      />
    </div>
  );
}
