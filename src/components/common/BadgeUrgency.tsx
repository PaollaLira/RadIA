import React from 'react';
import { UrgencyLevel } from '../../types/report';
import { useLanguage } from '../../i18n/LanguageContext';
import { AlertCircle, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface BadgeUrgencyProps {
  level: UrgencyLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const BadgeUrgency: React.FC<BadgeUrgencyProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const { t } = useLanguage();

  const configs = {
    EMERGENCY: {
      label: t.urgency.EMERGENCY,
      shortLabel: t.urgency.EMERGENCY_SHORT,
      classes:
        'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
      icon: AlertCircle,
    },
    URGENT: {
      label: t.urgency.URGENT,
      shortLabel: t.urgency.URGENT,
      classes:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
      icon: AlertTriangle,
    },
    PRIORITY: {
      label: t.urgency.PRIORITY,
      shortLabel: t.urgency.PRIORITY,
      classes:
        'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
      icon: Clock,
    },
    ELECTIVE: {
      label: t.urgency.ELECTIVE,
      shortLabel: t.urgency.ELECTIVE_SHORT,
      classes:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
      icon: CheckCircle2,
    },
  };

  const config = configs[level] || configs.ELECTIVE;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border whitespace-nowrap ${config.classes} ${sizeClasses}`}
      role="status"
      aria-label={`${t.urgency.ariaPrefix}: ${config.label}`}
    >
      {showIcon && (
        <Icon
          className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'}
          aria-hidden="true"
        />
      )}
      <span>{size === 'sm' ? config.shortLabel : config.label}</span>
    </span>
  );
};
