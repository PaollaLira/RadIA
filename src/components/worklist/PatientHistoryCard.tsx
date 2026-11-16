import React from 'react';
import { Patient } from '../../types/patient';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizePatient } from '../../i18n/demoLocalization';
import { User, History, AlertTriangle, Pill, Activity, Calendar } from 'lucide-react';

interface PatientHistoryCardProps {
  patient: Patient;
}

export const PatientHistoryCard: React.FC<PatientHistoryCardProps> = ({ patient }) => {
  const { lang, t } = useLanguage();
  const localized = localizePatient(patient, lang);

  const genderLabel =
    localized.gender === 'M'
      ? t.patientCard.male
      : localized.gender === 'F'
      ? t.patientCard.female
      : t.patientCard.other;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-700 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {localized.name}
            </h2>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>
              {localized.age} {t.patientCard.years}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.patientCard.genderLabel}: {genderLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {t.patientCard.record}: {localized.recordNumber}
            </span>
            {localized.roomBed && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-teal-700 dark:text-cyan-400 font-medium">
                  {localized.roomBed}
                </span>
              </>
            )}
          </div>
        </div>

        {localized.renalFunction && (
          <div className="text-right text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
              {t.patientCard.renalFunction}
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              Cr: {localized.renalFunction.creatinine} mg/dL
            </span>
            {localized.renalFunction.eGFR && (
              <span className="text-slate-500 dark:text-slate-400 text-[11px] ml-1">
                (eGFR: {localized.renalFunction.eGFR})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Clinical Indication */}
      <div className="mt-3.5">
        <span className="text-[11px] uppercase tracking-wider text-teal-800 dark:text-cyan-400 font-bold block mb-1">
          {t.patientCard.clinicalIndication}
        </span>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          {localized.clinicalIndication}
        </p>
      </div>

      {/* Grid: Comorbidities, Allergies, Medications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5 text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.patientCard.comorbidities}</span>
          </div>
          {localized.comorbidities.length > 0 ? (
            <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
              {localized.comorbidities.map((item, idx) => (
                <li key={idx} className="truncate">
                  · {item}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400 text-[11px]">{t.patientCard.noComorbidities}</span>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.patientCard.allergies}</span>
          </div>
          {localized.allergies.length > 0 ? (
            <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
              {localized.allergies.map((item, idx) => (
                <li key={idx} className="truncate text-rose-600 dark:text-rose-400 font-medium">
                  · {item}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400 text-[11px]">{t.patientCard.noAllergies}</span>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold mb-1">
            <Pill className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.patientCard.medications}</span>
          </div>
          {localized.currentMedications.length > 0 ? (
            <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
              {localized.currentMedications.map((item, idx) => (
                <li key={idx} className="truncate">
                  · {item}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-slate-400 text-[11px]">{t.patientCard.noMedications}</span>
          )}
        </div>
      </div>

      {/* Prior Imaging Exams */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
          <History className="w-3.5 h-3.5 text-teal-700 dark:text-cyan-400" />
          <span>
            {t.patientCard.priorExams} ({localized.priorExams.length})
          </span>
        </div>

        {localized.priorExams.length > 0 ? (
          <div className="space-y-2">
            {localized.priorExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-lg p-2.5 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="text-teal-700 dark:text-cyan-400 uppercase font-mono">
                      {exam.modality}
                    </span>
                    <span>{exam.region}</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 font-normal">
                    <Calendar className="w-3 h-3" />
                    {exam.date}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 leading-snug">
                  {exam.summary}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">{t.patientCard.noPriorExams}</p>
        )}
      </div>
    </div>
  );
};
