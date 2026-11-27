import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Sun, Moon, Database, Plus, Ruler, Globe, LogOut, Sparkles } from 'lucide-react';
import { AuthSession } from '../../types/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavBarProps {
  activeTab: 'diagnostic' | 'measurements' | 'backup';
  onSelectTab: (tab: 'diagnostic' | 'measurements' | 'backup') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNewExam: () => void;
  session?: AuthSession | null;
  onOpenSubscription?: () => void;
  onLogout?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  onNewExam,
  session,
  onOpenSubscription,
  onLogout,
}) => {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6 h-14">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onSelectTab('diagnostic')}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm shrink-0 bg-[#09142B]">
              <img
                src="/assets/ultrai-med-icon.jfif"
                alt="UltrAI Med"
                className="w-full h-full object-cover scale-[1.12]"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                UltrAI Med
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium ml-1.5 hidden sm:inline">
                {t.brandSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
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
            onClick={() => onSelectTab('measurements')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'measurements'
                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-teal-900 dark:text-cyan-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            aria-label={t.nav.measurements}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>{t.nav.measurements}</span>
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

        {/* Zone 3: PWA Install, Trial Badge, Language Switcher, Theme, Primary Action & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <PWAInstallButton />
          {session?.subscriptionStatus === 'trial' && onOpenSubscription && (
            <button
              onClick={onOpenSubscription}
              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              title={
                lang === 'en'
                  ? 'Free trial active — click to subscribe'
                  : lang === 'es'
                    ? 'Prueba gratuita activa — clic para suscribirse'
                    : 'Período grátis ativo — clique para assinar'
              }
            >
              <Sparkles className="w-3 h-3" />
              <span>
                {session.daysRemaining}d{' '}
                {lang === 'en' ? 'trial' : lang === 'es' ? 'gratis' : 'grátis'}
              </span>
            </button>
          )}

          <button
            onClick={toggleLang}
            className="px-2 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
            title={t.nav.switchLanguage}
            aria-label={t.nav.switchLanguage}
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

          {session && onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-md transition-colors shrink-0"
              title={
                lang === 'en'
                  ? `Sign out (${session.name})`
                  : lang === 'es'
                    ? `Cerrar sesión / Cambiar cuenta (${session.name})`
                    : `Sair / Trocar conta (${session.name})`
              }
              aria-label={
                lang === 'en' ? 'Sign out' : lang === 'es' ? 'Cerrar sesión' : 'Sair'
              }
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
