import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Activity, Sun, Moon, Database, Plus, MessageSquare, Globe } from 'lucide-react';

interface TopNavBarProps {
  activeTab: 'worklist' | 'diagnostic' | 'backup';
  onSelectTab: (tab: 'worklist' | 'diagnostic' | 'backup') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  pendingCount: number;
  emergencyCount: number;
  onNewExam: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  pendingCount,
  emergencyCount,
  onNewExam,
  isChatOpen,
  onToggleChat,
}) => {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 h-14">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onSelectTab('worklist')}
          >
            <div className="w-8 h-8 rounded-lg bg-teal-800 dark:bg-teal-700 flex items-center justify-center text-cyan-300 shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                RadIA
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium ml-1.5 hidden sm:inline">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3 whitespace-nowrap">
            <span className="tabular-nums">
              {pendingCount} {t.nav.inQueue}
            </span>
            {emergencyCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                  {emergencyCount}{' '}
                  {emergencyCount === 1 ? t.nav.criticalSingle : t.nav.criticalPlural}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onSelectTab('worklist')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'worklist'
                ? 'bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-cyan-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.nav.worklist}
            <span className="hidden md:inline"> {t.nav.worklistFull}</span>
          </button>
          <button
            onClick={() => onSelectTab('diagnostic')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'diagnostic'
                ? 'bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-cyan-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {t.nav.report}
          </button>
          <button
            onClick={onToggleChat}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              isChatOpen
                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-teal-900 dark:text-cyan-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            aria-label={t.nav.chat}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.nav.chat}</span>
          </button>
          <button
            onClick={() => onSelectTab('backup')}
            className="px-2 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1"
            title={t.dataModal.title}
            aria-label={t.dataModal.title}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{t.nav.data}</span>
          </button>
        </nav>

        {/* Zone 3: Language Switcher, Theme & Primary Action */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleLang}
            className="px-2 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            title={lang === 'pt' ? t.nav.switchToEnglish : t.nav.switchToPortuguese}
            aria-label={lang === 'pt' ? t.nav.switchToEnglish : t.nav.switchToPortuguese}
          >
            <Globe className="w-3.5 h-3.5 text-teal-700 dark:text-cyan-400" />
            <span className="font-mono uppercase">{lang}</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-md transition-colors shrink-0"
            title={t.nav.toggleTheme}
            aria-label={t.nav.toggleTheme}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onNewExam}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.nav.newExam}</span>
            <span className="sm:hidden">{t.nav.newExamShort}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
