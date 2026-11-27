import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useLanguage } from '../../i18n/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t } = useLanguage();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="no-print fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white shadow-lg max-w-xs sm:max-w-sm"
    >
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>{t.pwa.offlineMsg}</span>
    </div>
  );
};
