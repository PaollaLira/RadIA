import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatModelMode } from '../../types/chat';
import { Patient } from '../../types/patient';
import { UltrasoundExam } from '../../types/ultrasound';
import { StandardizedRadiologyReport } from '../../types/report';
import { ChatService } from '../../services/chatService';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizePatient, localizeExam } from '../../i18n/demoLocalization';
import {
  MessageSquare,
  Send,
  X,
  Trash2,
  Image as ImageIcon,
  Zap,
  Brain,
  AlertCircle,
} from 'lucide-react';

interface RadiologyChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  exam?: UltrasoundExam;
  report?: StandardizedRadiologyReport | null;
  imageDataUrl?: string | null;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  onClearHistory: () => void;
}

export const RadiologyChatbot: React.FC<RadiologyChatbotProps> = ({
  isOpen,
  onClose,
  patient,
  exam,
  report,
  imageDataUrl,
  messages,
  onMessagesChange,
  onClearHistory,
}) => {
  const { lang, t } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const localizedPatient = patient ? localizePatient(patient, lang) : undefined;
  const localizedExam = exam ? localizeExam(exam, lang) : undefined;

  const [input, setInput] = useState('');
  const [modelMode, setModelMode] = useState<ChatModelMode>('reasoning');
  const [attachImage, setAttachImage] = useState<boolean>(!!imageDataUrl);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAttachImage(!!imageDataUrl);
  }, [imageDataUrl]);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending]);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const trimmed = (customPrompt ?? input).trim();
    if (!trimmed || isSending) return;

    setErrorMsg(null);
    const shouldAttachImage = attachImage && !!imageDataUrl;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      attachedImage: shouldAttachImage,
    };

    const nextHistory = [...messages, userMsg];
    onMessagesChange(nextHistory);
    if (!customPrompt) setInput('');
    setIsSending(true);

    try {
      const { reply, modelUsed } = await ChatService.sendMessage({
        messages: nextHistory,
        patient: localizedPatient,
        exam: localizedExam,
        report,
        imageDataUrl,
        attachImage: shouldAttachImage,
        modelMode,
        language: lang,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-m`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        modelUsed,
      };

      onMessagesChange([...nextHistory, assistantMsg]);
    } catch (err: unknown) {
      const fallbackErr =
        lang === 'en'
          ? 'Failed to get a response from RadIA assistant.'
          : 'Erro ao obter resposta do assistente RadIA.';
      const message = err instanceof Error ? err.message : fallbackErr;
      setErrorMsg(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const examLabel = localizedExam ? t.specialties[localizedExam.specialty] : 'USG';

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
      role="dialog"
      aria-label={t.chat.title}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-800 dark:bg-teal-700 text-cyan-300 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {t.chat.title}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {localizedPatient ? `${localizedPatient.name} · ${examLabel}` : t.chat.consultant}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {messages.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title={t.chat.clearHistory}
              aria-label={t.chat.clearHistory}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={t.chat.close}
            aria-label={t.chat.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Mode Selector */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {t.chat.profileLabel}
        </span>
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setModelMode('reasoning')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
              modelMode === 'reasoning'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Brain className="w-3 h-3" />
            <span>{t.chat.modeReasoning}</span>
          </button>
          <button
            onClick={() => setModelMode('fast')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors whitespace-nowrap ${
              modelMode === 'fast'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-200 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{t.chat.modeFast}</span>
          </button>
        </div>
      </div>

      {/* Scrollable Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="space-y-4 py-2">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-teal-800 dark:text-cyan-400 block mb-1">
                {t.chat.welcomeTitle}
              </span>
              {t.chat.welcomeBodyPrefix}{' '}
              <strong className="text-slate-900 dark:text-slate-100">
                {localizedPatient?.name || t.chat.activePatientFallback}
              </strong>
              .
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t.chat.quickPromptsTitle}
              </span>
              {t.chat.quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2.5 rounded-lg text-xs bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-teal-800 text-white dark:bg-teal-700'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                {msg.attachedImage && (
                  <div className="flex items-center gap-1 text-[10px] text-cyan-200 mb-1 pb-1 border-b border-teal-700/60">
                    <ImageIcon className="w-3 h-3" />
                    <span>{t.chat.attachedImageTag}</span>
                  </div>
                )}
                {msg.text}
              </div>
              <div className="mt-1 px-1 text-[10px] text-slate-400 font-mono tabular-nums flex items-center gap-1.5">
                <span>{msg.role === 'user' ? t.chat.you : 'RadIA'}</span>
                <span aria-hidden="true">·</span>
                <span>{msg.timestamp}</span>
              </div>
            </div>
          ))
        )}

        {isSending && (
          <div className="flex items-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>{t.chat.thinking}</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        {imageDataUrl && (
          <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={attachImage}
              onChange={(e) => setAttachImage(e.target.checked)}
              className="rounded border-slate-300 text-teal-700 focus:ring-cyan-500"
            />
            <ImageIcon className="w-3.5 h-3.5 text-teal-700 dark:text-cyan-400" />
            <span>{t.chat.attachCheckbox}</span>
          </label>
        )}

        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.chat.placeholder}
            className="flex-1 text-xs sm:text-sm p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
            className="min-h-[44px] min-w-[44px] px-3.5 rounded-lg bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
            title="Send"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
