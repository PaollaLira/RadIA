import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLanguage } from '../../i18n/LanguageContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="px-2 sm:px-2.5 py-1.5 min-h-[36px] sm:min-h-0 rounded-md text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-teal-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
        title={t.pwa.installTitle}
        aria-label={t.pwa.installTitle}
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden md:inline">{t.pwa.installBtn}</span>
        <span className="md:hidden">{t.pwa.installShort}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="px-2 sm:px-2.5 py-1.5 min-h-[36px] sm:min-h-0 rounded-md text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-teal-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          title={t.pwa.installTitle}
          aria-label={t.pwa.installTitle}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t.pwa.installBtn}</span>
          <span className="md:hidden">{t.pwa.installShort}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 pt-[calc(1.5rem+env(safe-area-inset-top))] sm:pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))] backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label={t.pwa.iosTitle}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {t.pwa.iosTitle}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label={t.pwa.iosClose}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-teal-800 dark:text-cyan-300 flex items-center justify-center shrink-0">
                    <Share className="w-3.5 h-3.5" />
                  </span>
                  <p className="leading-snug pt-0.5">1. {t.pwa.iosStep1}</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-teal-800 dark:text-cyan-300 flex items-center justify-center shrink-0">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </span>
                  <p className="leading-snug pt-0.5">2. {t.pwa.iosStep2}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                {t.pwa.iosClose}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
