import React, { useState, useEffect } from 'react';
import { StandardizedRadiologyReport } from '../../types/report';
import { Patient } from '../../types/patient';
import { PdfReportService } from '../../services/pdfReportService';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Copy,
  FileDown,
  Check,
  BookOpen,
  Stethoscope,
  ClipboardList,
  Edit3,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface StructuredReportViewProps {
  report: StandardizedRadiologyReport;
  patient: Patient;
  imageDataUrl?: string | null;
  onUpdateReport?: (updated: StandardizedRadiologyReport) => void;
}

export const StructuredReportView: React.FC<StructuredReportViewProps> = ({
  report,
  patient,
  imageDataUrl,
  onUpdateReport,
}) => {
  const { lang, t } = useLanguage();
  const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR';

  const defaultLicense =
    lang === 'en'
      ? 'MD / License 123456'
      : lang === 'es'
      ? 'Matrícula / Col. 123456'
      : 'CRM/UF 123456';

  const [copied, setCopied] = useState<boolean>(false);
  const [pdfExported, setPdfExported] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableReport, setEditableReport] = useState<StandardizedRadiologyReport>(report);
  const [physicianCRM, setPhysicianCRM] = useState<string>(report.crm || defaultLicense);
  const [physicianName, setPhysicianName] = useState<string>(
    report.radiologistName || t.report.defaultPhysician
  );

  useEffect(() => {
    setEditableReport(report);
    setPhysicianCRM(report.crm || defaultLicense);
    setPhysicianName(report.radiologistName || t.report.defaultPhysician);
    setIsEditing(false);
  }, [report, defaultLicense, t.report.defaultPhysician]);

  useEffect(() => {
    if (!report.radiologistName) {
      setPhysicianName(t.report.defaultPhysician);
    }
    if (!report.crm) {
      setPhysicianCRM(defaultLicense);
    }
  }, [lang, report.radiologistName, report.crm, t.report.defaultPhysician, defaultLicense]);

  const currentReport = isEditing ? editableReport : report;

  const genderLabel =
    patient.gender === 'M'
      ? t.report.male
      : patient.gender === 'F'
        ? t.report.female
        : t.report.other;

  const formattedBirthDate = (() => {
    if (!patient.birthDate) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(patient.birthDate)) {
      const [y, m, d] = patient.birthDate.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(locale);
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(patient.birthDate)) {
      const [d, m, y] = patient.birthDate.split('/').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(locale);
    }
    return patient.birthDate;
  })();

  const handleCopyFormattedText = () => {
    const patientFallback =
      lang === 'en' ? 'Not specified' : lang === 'es' ? 'No especificado' : 'Não informado';

    const textToCopy =
      lang === 'en'
        ? `
ULTRASOUND MEDICAL REPORT — ULTRAI MED DIAGNOSTIC COPILOT
======================================================
EXAM PERFORMED: ${currentReport.technique.protocolName}
PATIENT: ${patient.name || patientFallback}
${patient.cpf ? `ID / CPF: ${patient.cpf} | ` : ''}${formattedBirthDate ? `DOB: ${formattedBirthDate} | ` : ''}${patient.age > 0 ? `AGE: ${patient.age} yrs | ` : ''}SEX: ${genderLabel}
DATE: ${new Date(currentReport.createdAt).toLocaleDateString('en-US')}
------------------------------------------------------
1. TECHNIQUE AND EXAM PROTOCOL:
- Exam: ${currentReport.technique.protocolName}
- Transducer: ${currentReport.technique.transducerType}
- Acoustic Windows: ${currentReport.technique.acousticWindows}
- Preparation: ${currentReport.technique.patientPreparation}

2. DETAILED RADIOLOGICAL FINDINGS:
${currentReport.findings.map((f) => `• ${f.region}: ${f.description}${f.measurements ? ` (${f.measurements})` : ''}`).join('\n')}

3. DIAGNOSTIC IMPRESSION:
- Primary Diagnosis: ${currentReport.diagnosticImpression.primaryDiagnosis}
${currentReport.diagnosticImpression.classificationScore ? `- Standardized Score: ${currentReport.diagnosticImpression.classificationScore}\n` : ''}${currentReport.diagnosticImpression.differentialDiagnoses.length > 0 ? `- Differential Diagnoses: ${currentReport.diagnosticImpression.differentialDiagnoses.join('; ')}\n` : ''}${currentReport.diagnosticImpression.comparativeEvolution ? `- Prior Comparison: ${currentReport.diagnosticImpression.comparativeEvolution}\n` : ''}
${currentReport.medicalLiterature.length > 0 ? `4. MEDICAL REFERENCES:\n${currentReport.medicalLiterature.map((l) => `• ${l.guidelineOrStudy} (${l.organizationOrJournal}, ${l.year}): ${l.summaryOfEvidence}`).join('\n')}\n` : ''}
------------------------------------------------------
SIGNATURE:
${physicianName} - ${physicianCRM}
Report issued with UltrAI Med decision support (International Ultrasound Guidelines).
      `.trim()
        : lang === 'es'
        ? `
INFORME MÉDICO DE ULTRASONOGRAFÍA — ULTRAI MED COPILOTO DIAGNÓSTICO
======================================================
ESTUDIO REALIZADO: ${currentReport.technique.protocolName}
PACIENTE: ${patient.name || patientFallback}
${patient.cpf ? `CPF / DOC.: ${patient.cpf} | ` : ''}${formattedBirthDate ? `NACIMIENTO: ${formattedBirthDate} | ` : ''}${patient.age > 0 ? `EDAD: ${patient.age} años | ` : ''}SEXO: ${genderLabel}
FECHA: ${new Date(currentReport.createdAt).toLocaleDateString('es-ES')}
------------------------------------------------------
1. TÉCNICA Y PROTOCOLO DEL ESTUDIO:
- Estudio: ${currentReport.technique.protocolName}
- Transductor: ${currentReport.technique.transducerType}
- Ventanas Acústicas: ${currentReport.technique.acousticWindows}
- Preparación: ${currentReport.technique.patientPreparation}

2. HALLAZGOS RADIOLÓGICOS DETALLADOS:
${currentReport.findings.map((f) => `• ${f.region}: ${f.description}${f.measurements ? ` (${f.measurements})` : ''}`).join('\n')}

3. IMPRESIÓN DIAGNÓSTICA:
- Diagnóstico Principal: ${currentReport.diagnosticImpression.primaryDiagnosis}
${currentReport.diagnosticImpression.classificationScore ? `- Clasificación / Escala: ${currentReport.diagnosticImpression.classificationScore}\n` : ''}${currentReport.diagnosticImpression.differentialDiagnoses.length > 0 ? `- Diagnósticos Diferenciales: ${currentReport.diagnosticImpression.differentialDiagnoses.join('; ')}\n` : ''}${currentReport.diagnosticImpression.comparativeEvolution ? `- Comparación Previa: ${currentReport.diagnosticImpression.comparativeEvolution}\n` : ''}
${currentReport.medicalLiterature.length > 0 ? `4. REFERENCIAS MÉDICAS:\n${currentReport.medicalLiterature.map((l) => `• ${l.guidelineOrStudy} (${l.organizationOrJournal}, ${l.year}): ${l.summaryOfEvidence}`).join('\n')}\n` : ''}
------------------------------------------------------
FIRMA:
${physicianName} - ${physicianCRM}
Informe emitido con apoyo de UltrAI Med (Guías Internacionales de Ultrasonografía).
      `.trim()
        : `
LAUDO DE ULTRASSONOGRAFIA — ULTRAI MED COPILOTO DIAGNÓSTICO
======================================================
EXAME REALIZADO: ${currentReport.technique.protocolName}
PACIENTE: ${patient.name || patientFallback}
${patient.cpf ? `CPF: ${patient.cpf} | ` : ''}${formattedBirthDate ? `NASCIMENTO: ${formattedBirthDate} | ` : ''}${patient.age > 0 ? `IDADE: ${patient.age} anos | ` : ''}SEXO: ${genderLabel}
DATA: ${new Date(currentReport.createdAt).toLocaleDateString('pt-BR')}
------------------------------------------------------
1. TÉCNICA E PROTOCOLO:
- Exame: ${currentReport.technique.protocolName}
- Transdutor: ${currentReport.technique.transducerType}
- Janelas Acústicas: ${currentReport.technique.acousticWindows}
- Preparo: ${currentReport.technique.patientPreparation}

2. ACHADOS RADIOLÓGICOS DETALHADOS:
${currentReport.findings.map((f) => `• ${f.region}: ${f.description}${f.measurements ? ` (${f.measurements})` : ''}`).join('\n')}

3. IMPRESSÃO DIAGNÓSTICA:
- Diagnóstico Principal: ${currentReport.diagnosticImpression.primaryDiagnosis}
${currentReport.diagnosticImpression.classificationScore ? `- Classificação / Score: ${currentReport.diagnosticImpression.classificationScore}\n` : ''}${currentReport.diagnosticImpression.differentialDiagnoses.length > 0 ? `- Diagnósticos Diferenciais: ${currentReport.diagnosticImpression.differentialDiagnoses.join('; ')}\n` : ''}${currentReport.diagnosticImpression.comparativeEvolution ? `- Evolução Comparativa: ${currentReport.diagnosticImpression.comparativeEvolution}\n` : ''}
${currentReport.medicalLiterature.length > 0 ? `4. REFERÊNCIAS MÉDICAS:\n${currentReport.medicalLiterature.map((l) => `• ${l.guidelineOrStudy} (${l.organizationOrJournal}, ${l.year}): ${l.summaryOfEvidence}`).join('\n')}\n` : ''}
------------------------------------------------------
ASSINATURA:
${physicianName} - ${physicianCRM}
Laudo emitido com suporte do UltrAI Med (Diretrizes Internacionais de Ultrassonografia).
      `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPdf = async () => {
    const reportForPdf: StandardizedRadiologyReport = {
      ...currentReport,
      radiologistName: physicianName,
      crm: physicianCRM,
    };
    await PdfReportService.exportReportToPdf({
      report: reportForPdf,
      patient,
      physicianName,
      physicianCRM,
      imageDataUrl,
      lang,
    });
    setPdfExported(true);
    setTimeout(() => setPdfExported(false), 2500);
  };

  const handleSaveEdits = () => {
    const updated: StandardizedRadiologyReport = {
      ...editableReport,
      radiologistName: physicianName,
      crm: physicianCRM,
    };
    if (onUpdateReport) {
      onUpdateReport(updated);
    }
    setIsEditing(false);
  };

  const handleFindingDescriptionChange = (index: number, newDescription: string) => {
    setEditableReport((prev) => {
      const updatedFindings = prev.findings.map((item, idx) =>
        idx === index ? { ...item, description: newDescription } : item
      );
      return { ...prev, findings: updatedFindings };
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-teal-800 dark:text-cyan-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            {t.report.headerTitle}
          </span>
          <span className="text-slate-400 text-xs hidden md:inline">· {t.report.headerSubtitle}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (isEditing) {
                setEditableReport(report);
              }
              setIsEditing((prev) => !prev);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isEditing
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? t.report.cancelEdit : t.report.edit}</span>
          </button>

          {isEditing && (
            <button
              onClick={handleSaveEdits}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-800 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.report.saveEdits}</span>
            </button>
          )}

          <button
            onClick={handleCopyFormattedText}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title={t.report.copy}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.report.copied : t.report.copy}</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-800 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            title={t.report.exportPdf}
            aria-label={t.report.exportPdf}
          >
            {pdfExported ? (
              <Check className="w-3.5 h-3.5 text-cyan-300" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{pdfExported ? t.report.pdfExported : t.report.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Report Document Body */}
      <div className="p-5 sm:p-8 space-y-6 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-sans">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-800 dark:text-cyan-400 block">
                {t.report.docKicker}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                {t.report.docTitle}
              </h1>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                {new Date(currentReport.createdAt).toLocaleDateString(locale)}
              </span>
            </div>
          </div>

          {/* Highlighted Performed Exam Banner */}
          <div className="bg-teal-50/90 dark:bg-teal-950/50 border-l-4 border-teal-700 dark:border-cyan-400 px-3.5 py-2.5 rounded-r-lg">
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 dark:text-cyan-400 block">
              {t.report.examPerformed}
            </span>
            <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-cyan-100 tracking-tight uppercase mt-0.5">
              {currentReport.technique.protocolName}
            </p>
          </div>

          {/* Patient Metadata */}
          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>
              {t.report.patient}:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {patient.name ||
                  (lang === 'en'
                    ? 'Not specified'
                    : lang === 'es'
                    ? 'No especificado'
                    : 'Não informado')}
              </strong>
            </span>
            {patient.cpf && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {t.report.cpf}:{' '}
                  <strong className="font-mono text-slate-700 dark:text-slate-300">
                    {patient.cpf}
                  </strong>
                </span>
              </>
            )}
            {formattedBirthDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {t.report.birthDate}:{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {formattedBirthDate}
                  </strong>
                </span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>
              {patient.age > 0 ? `${patient.age} ${t.report.years} · ` : ''}
              {genderLabel}
            </span>
          </div>
        </div>

        {/* 1. TECHNIQUE AND EXAM PROTOCOL */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5 flex items-center gap-1.5">
            <span>{t.report.sec1}</span>
          </h2>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1 text-xs leading-relaxed">
            <p><strong>{t.report.examPerformed}:</strong> {currentReport.technique.protocolName}</p>
            <p><strong>{t.report.transducer}:</strong> {currentReport.technique.transducerType}</p>
            <p><strong>{t.report.acousticWindows}:</strong> {currentReport.technique.acousticWindows}</p>
            <p><strong>{t.report.patientPrep}:</strong> {currentReport.technique.patientPreparation}</p>
            {currentReport.technique.technicalLimitations && (
              <p className="text-slate-500 dark:text-slate-400">
                <strong>{t.report.techLimits}:</strong> {currentReport.technique.technicalLimitations}
              </p>
            )}
          </div>
        </div>

        {/* 2. DETAILED RADIOLOGICAL FINDINGS */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5">
            {t.report.sec2}
          </h2>
          <div className="space-y-2">
            {currentReport.findings.map((finding, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <span>{finding.region}</span>
                  {finding.measurements && (
                    <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 font-medium">
                      {finding.measurements}
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={finding.description}
                    onChange={(e) => handleFindingDescriptionChange(idx, e.target.value)}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {finding.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. DIAGNOSTIC IMPRESSION */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{t.report.sec3}</span>
          </h2>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.report.primaryDiag}</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editableReport.diagnosticImpression.primaryDiagnosis}
                  onChange={(e) =>
                    setEditableReport((prev) => ({
                      ...prev,
                      diagnosticImpression: {
                        ...prev.diagnosticImpression,
                        primaryDiagnosis: e.target.value,
                      },
                    }))
                  }
                  className="w-full mt-1 text-xs font-semibold p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              ) : (
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {currentReport.diagnosticImpression.primaryDiagnosis}
                </p>
              )}
            </div>

            {currentReport.diagnosticImpression.classificationScore && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {t.report.classificationScore}
                </span>
                <span className="inline-block mt-0.5 font-semibold text-teal-800 dark:text-cyan-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 px-2 py-0.5 rounded text-xs">
                  {currentReport.diagnosticImpression.classificationScore}
                </span>
              </div>
            )}

            {currentReport.diagnosticImpression.differentialDiagnoses.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.report.diffDiag}</span>
                <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-0.5 mt-0.5">
                  {currentReport.diagnosticImpression.differentialDiagnoses.map((diff, i) => (
                    <li key={i}>{diff}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentReport.diagnosticImpression.comparativeEvolution && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {t.report.priorComparison}
                </span>
                <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">
                  {currentReport.diagnosticImpression.comparativeEvolution}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. SUMMARIZED MEDICAL REFERENCES */}
        {currentReport.medicalLiterature.length > 0 && (
          <div>
            <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.report.sec4}</span>
            </h2>
            <div className="space-y-1.5">
              {currentReport.medicalLiterature.map((lit, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 font-semibold text-slate-900 dark:text-slate-100">
                    <span className="text-teal-800 dark:text-cyan-400">
                      {lit.guidelineOrStudy}{' '}
                      <span className="font-normal text-slate-500 dark:text-slate-400">
                        ({lit.organizationOrJournal}, {lit.year})
                      </span>
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug mt-0.5">
                    {lit.summaryOfEvidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attending Radiologist Signature */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-cyan-400" />
              <input
                type="text"
                value={physicianName}
                onChange={(e) => setPhysicianName(e.target.value)}
                className="font-bold text-slate-900 dark:text-slate-100 bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{t.report.license}:</span>
              <input
                type="text"
                value={physicianCRM}
                onChange={(e) => setPhysicianCRM(e.target.value)}
                className="font-mono bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none focus:border-cyan-500 text-xs w-36"
              />
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400">
            <span>{t.report.footerBrand}</span>
            <span className="block text-[10px]">{t.report.footerSub}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
