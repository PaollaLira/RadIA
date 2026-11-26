import React, { useState } from 'react';
import { Patient } from '../../types/patient';
import { UltrasoundExam, UltrasoundSpecialty } from '../../types/ultrasound';
import { BadgeUrgency } from '../common/BadgeUrgency';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizePatient } from '../../i18n/demoLocalization';
import { Search, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface WorklistQueueProps {
  patients: Patient[];
  exams: UltrasoundExam[];
  activeExamId: string | null;
  onSelectExam: (examId: string, patientId: string) => void;
  onNewExam: () => void;
}

export const WorklistQueue: React.FC<WorklistQueueProps> = ({
  patients,
  exams,
  activeExamId,
  onSelectExam,
  onNewExam,
}) => {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<'ALL' | 'CRITICAL_ONLY' | 'ELECTIVE'>('ALL');

  const getSpecialtyName = (spec?: UltrasoundSpecialty | ''): string => {
    if (!spec) return lang === 'pt' ? 'Geral' : 'General';
    if (spec === 'ABDOMEN') return t.specialties.ABDOMEN_SHORT;
    if (spec === 'BREAST') return t.specialties.BREAST_SHORT;
    return t.specialties[spec];
  };

  const urgencyWeight = {
    EMERGENCY: 4,
    URGENT: 3,
    PRIORITY: 2,
    ELECTIVE: 1,
  };

  const combinedItems = exams
    .map((exam) => {
      const rawPatient = patients.find((p) => p.id === exam.patientId);
      const patient = rawPatient ? localizePatient(rawPatient, lang) : undefined;
      return { exam, patient };
    })
    .filter((item): item is { exam: UltrasoundExam; patient: Patient } => !!item.patient)
    .sort((a, b) => {
      const weightA = urgencyWeight[a.exam.urgency] || 0;
      const weightB = urgencyWeight[b.exam.urgency] || 0;
      if (weightB !== weightA) return weightB - weightA;

      if (a.exam.status === 'PENDING' && b.exam.status === 'REPORTED') return -1;
      if (b.exam.status === 'PENDING' && a.exam.status === 'REPORTED') return 1;

      return 0;
    });

  const filteredItems = combinedItems.filter(({ exam, patient }) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      patient.name.toLowerCase().includes(term) ||
      patient.recordNumber.toLowerCase().includes(term) ||
      patient.clinicalIndication.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (urgencyFilter === 'CRITICAL_ONLY') {
      if (exam.urgency !== 'EMERGENCY' && exam.urgency !== 'URGENT') return false;
    } else if (urgencyFilter === 'ELECTIVE') {
      if (exam.urgency !== 'ELECTIVE' && exam.urgency !== 'PRIORITY') return false;
    }

    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Worklist Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 dark:text-cyan-400 block">
              {t.worklist.kicker}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {t.worklist.title} ({filteredItems.length} {t.worklist.examsCount})
            </h2>
          </div>

          <button
            onClick={onNewExam}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 transition-colors shadow-sm"
          >
            {t.worklist.addPatient}
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.worklist.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>

          <div className="sm:col-span-6 flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setUrgencyFilter('ALL')}
              className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                urgencyFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-200 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.worklist.filterAll}
            </button>
            <button
              onClick={() => setUrgencyFilter('CRITICAL_ONLY')}
              className={`flex-1 py-1 rounded text-center font-medium transition-colors flex items-center justify-center gap-1 ${
                urgencyFilter === 'CRITICAL_ONLY'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3 h-3 text-rose-600" />
              <span>{t.worklist.filterCritical}</span>
            </button>
            <button
              onClick={() => setUrgencyFilter('ELECTIVE')}
              className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                urgencyFilter === 'ELECTIVE'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.worklist.filterElective}
            </button>
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-[640px]">
        {filteredItems.length > 0 ? (
          filteredItems.map(({ exam, patient }) => {
            const isActive = exam.id === activeExamId;
            return (
              <div
                key={exam.id}
                onClick={() => onSelectExam(exam.id, patient.id)}
                className={`p-4 sm:p-4.5 transition-colors cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-teal-50/70 dark:bg-teal-950/40'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1 w-full sm:max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {patient.name}
                    </span>
                    <BadgeUrgency level={exam.urgency} size="sm" />
                    <span className="text-[11px] text-slate-500 font-mono">
                      {patient.recordNumber}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                    {patient.clinicalIndication}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-teal-800 dark:text-cyan-400">
                      USG {getSpecialtyName(exam.specialty)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {patient.age} {t.worklist.years}
                    </span>
                    {patient.roomBed && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{patient.roomBed}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3 h-3" />
                      {exam.createdAt.split(' ')[1] || exam.createdAt}
                    </span>
                  </div>
                </div>

                {/* Right Action Touch Target */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                      exam.status === 'REPORTED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : exam.status === 'IN_PROGRESS'
                        ? 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {exam.status === 'REPORTED'
                      ? t.worklist.statusReported
                      : exam.status === 'IN_PROGRESS'
                      ? t.worklist.statusInProgress
                      : t.worklist.statusPending}
                  </span>

                  <button
                    className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                      isActive
                        ? 'bg-teal-800 text-white dark:bg-teal-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                    title={t.worklist.openCaseTitle}
                    aria-label={`${t.worklist.openCaseTitle}: ${patient.name}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">{t.worklist.empty}</div>
        )}
      </div>
    </div>
  );
};
