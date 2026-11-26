import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { PdfReportService } from '../../services/pdfReportService';
import { Patient } from '../../types/patient';
import { UltrasoundExam } from '../../types/ultrasound';
import { StandardizedRadiologyReport } from '../../types/report';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizePatient } from '../../i18n/demoLocalization';
import {
  Database,
  FileDown,
  Image as ImageIcon,
  FileText,
  RotateCcw,
  X,
  Shield,
  Check,
  AlertCircle,
} from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  patients: Patient[];
  exams: UltrasoundExam[];
  activePatient?: Patient;
  activeExam?: UltrasoundExam;
  activeReport?: StandardizedRadiologyReport | null;
  activeImageDataUrl?: string | null;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  patients,
  exams,
  activePatient,
  activeExam,
  activeReport,
  activeImageDataUrl,
}) => {
  const { lang, t } = useLanguage();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const localizedActivePatient = activePatient ? localizePatient(activePatient, lang) : undefined;
  const allReports = storageService.getData().reports;
  const reportedCount = Object.keys(allReports).length;

  const handleExportActivePdf = async () => {
    if (!localizedActivePatient || !activeReport) {
      setStatusMsg(t.dataModal.errNoReport);
      setIsSuccess(false);
      return;
    }

    await PdfReportService.exportReportToPdf({
      report: activeReport,
      patient: localizedActivePatient,
      physicianName: activeReport.radiologistName || t.report.defaultPhysician,
      physicianCRM:
        activeReport.crm ||
        (lang === 'en'
          ? 'MD / License 123456'
          : lang === 'es'
            ? 'Matrícula / Col. 123456'
            : 'CRM/UF 123456'),
      imageDataUrl: activeImageDataUrl || activeExam?.capturedImageUrl,
      lang,
    });
    setStatusMsg(`${t.dataModal.okPdf} ${localizedActivePatient.name}.`);
    setIsSuccess(true);
  };

  const handleDownloadJpeg = async () => {
    const imgSource = activeImageDataUrl || activeExam?.capturedImageUrl;
    if (!imgSource || !localizedActivePatient) {
      setStatusMsg(t.dataModal.errNoImage);
      setIsSuccess(false);
      return;
    }

    const ok = await PdfReportService.downloadImageAsJpeg(
      imgSource,
      localizedActivePatient.name,
      lang
    );
    if (ok) {
      setStatusMsg(`${t.dataModal.okJpeg} ${localizedActivePatient.name}.`);
      setIsSuccess(true);
    } else {
      setStatusMsg(t.dataModal.errJpegConvert);
      setIsSuccess(false);
    }
  };

  const handleExportShiftSummaryPdf = () => {
    PdfReportService.exportShiftSummaryPdf({
      patients: patients.map((p) => localizePatient(p, lang)),
      exams,
      reports: allReports,
      lang,
    });
    setStatusMsg(t.dataModal.okShift);
    setIsSuccess(true);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    storageService.resetToDefaults();
    setConfirmReset(false);
    setStatusMsg(t.dataModal.okReset);
    setIsSuccess(true);
    onDataChanged();
  };

  const hasImage = Boolean(activeImageDataUrl || activeExam?.capturedImageUrl);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={t.dataModal.title}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-800 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.dataModal.title}
            </h3>
          </div>
          <button
            onClick={() => {
              setConfirmReset(false);
              setStatusMsg(null);
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label={t.dataModal.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {/* Privacy Note */}
          <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-teal-700 dark:text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-teal-900 dark:text-cyan-300 block">
                {t.dataModal.privacyTitle}
              </span>
              <p className="text-teal-800 dark:text-teal-400 mt-0.5 leading-snug">
                {t.dataModal.privacyDesc}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{t.dataModal.patients}</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {patients.length}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{t.dataModal.exams}</span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {exams.length}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">{t.dataModal.reported}</span>
              <span className="text-lg font-bold font-mono tabular-nums text-teal-700 dark:text-cyan-400">
                {reportedCount}
              </span>
            </div>
          </div>

          {/* Export Actions: PDF & JPEG */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              {t.dataModal.activePatient}: {localizedActivePatient?.name || t.dataModal.noneSelected}
            </span>

            <button
              onClick={handleExportActivePdf}
              disabled={!activeReport}
              className="w-full py-2.5 px-4 rounded-lg bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-45 disabled:pointer-events-none"
            >
              <FileDown className="w-4 h-4 text-cyan-300" />
              <span>
                {hasImage ? t.dataModal.exportPdfWithImage : t.dataModal.exportPdfOnly}
              </span>
            </button>

            <button
              onClick={handleDownloadJpeg}
              disabled={!hasImage}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-45 disabled:pointer-events-none"
            >
              <ImageIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{t.dataModal.saveJpeg}</span>
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={handleExportShiftSummaryPdf}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <FileText className="w-4 h-4 text-teal-700 dark:text-cyan-400" />
                <span>{t.dataModal.exportShiftSummary}</span>
              </button>

              <button
                onClick={handleReset}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors border ${
                  confirmReset
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                    : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {confirmReset ? t.dataModal.resetConfirmBtn : t.dataModal.resetBtn}
                </span>
              </button>
            </div>
          </div>

          {/* Feedback Message */}
          {statusMsg && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                isSuccess
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
              }`}
            >
              {isSuccess ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
