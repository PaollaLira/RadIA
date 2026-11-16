import React, { useState, useEffect } from 'react';
import { StandardizedRadiologyReport } from '../../types/report';
import { Patient } from '../../types/patient';
import { PdfReportService } from '../../services/pdfReportService';
import { BadgeUrgency } from '../common/BadgeUrgency';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizePatient } from '../../i18n/demoLocalization';
import {
  Copy,
  FileDown,
  Check,
  BookOpen,
  UserCheck,
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
  const localizedPatient = localizePatient(patient, lang);
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';

  const defaultLicense = lang === 'en' ? 'MD / License 123456' : 'CRM/UF 123456';

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
    setPhysicianCRM(report.crm || (lang === 'en' ? 'MD / License 123456' : 'CRM/UF 123456'));
    setPhysicianName(report.radiologistName || t.report.defaultPhysician);
    setIsEditing(false);
  }, [report]);

  useEffect(() => {
    if (!report.radiologistName) {
      setPhysicianName(t.report.defaultPhysician);
    }
    if (!report.crm) {
      setPhysicianCRM(lang === 'en' ? 'MD / License 123456' : 'CRM/UF 123456');
    }
  }, [lang, report.radiologistName, report.crm, t.report.defaultPhysician]);

  const currentReport = isEditing ? editableReport : report;

  const genderLabel =
    localizedPatient.gender === 'M'
      ? t.patientCard.male
      : localizedPatient.gender === 'F'
        ? t.patientCard.female
        : t.patientCard.other;

  const handleCopyFormattedText = () => {
    const isEn = lang === 'en';
    const textToCopy = isEn
      ? `
ULTRASOUND MEDICAL REPORT — RADIA DIAGNOSTIC COPILOT
======================================================
PATIENT: ${localizedPatient.name}
AGE: ${localizedPatient.age} yrs | SEX: ${genderLabel} | RECORD: ${localizedPatient.recordNumber}
DATE: ${new Date(currentReport.createdAt).toLocaleDateString('en-US')} ${new Date(currentReport.createdAt).toLocaleTimeString('en-US')}
URGENCY TIER: ${t.urgency[currentReport.urgencyLevel]}
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
${currentReport.diagnosticImpression.classificationScore ? `- Standardized Score: ${currentReport.diagnosticImpression.classificationScore}\n` : ''}- Differential Diagnoses: ${currentReport.diagnosticImpression.differentialDiagnoses.join('; ')}
- Prior Comparison: ${currentReport.diagnosticImpression.comparativeEvolution || 'N/A'}

4. RISK & SEVERITY STRATIFICATION:
- Level: ${t.urgency[currentReport.urgencyLevel]}
- Rationale: ${currentReport.urgencyRationale}
- Immediate Action: ${currentReport.riskStratification.actionRecommendation}

5. RECOMMENDED SPECIALIST REFERRALS:
${currentReport.recommendedSpecialists.map((s) => `• ${s.specialty} [${s.timeframe}]: ${s.rationale}`).join('\n')}

6. SUGGESTED COMPLEMENTARY EXAMS:
${currentReport.complementaryExams.map((e) => `• ${e.examName} (${e.urgency}): ${e.clinicalJustification}`).join('\n')}

7. MEDICAL LITERATURE & GUIDELINES:
${currentReport.medicalLiterature.map((l) => `• ${l.guidelineOrStudy} (${l.organizationOrJournal}, ${l.year}) [${l.evidenceLevel}]: ${l.summaryOfEvidence}`).join('\n')}

------------------------------------------------------
SIGNATURE:
${physicianName} - ${physicianCRM}
Report issued with RadIA decision support (International Ultrasound Guidelines).
      `.trim()
      : `
LAUDO DE ULTRASSONOGRAFIA — RADIA COPILOTO DIAGNÓSTICO
======================================================
PACIENTE: ${localizedPatient.name}
IDADE: ${localizedPatient.age} anos | SEXO: ${genderLabel} | PRONTUÁRIO: ${localizedPatient.recordNumber}
DATA: ${new Date(currentReport.createdAt).toLocaleDateString('pt-BR')} ${new Date(currentReport.createdAt).toLocaleTimeString('pt-BR')}
GRAVIDADE ESTIMADA: ${t.urgency[currentReport.urgencyLevel]}
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
${currentReport.diagnosticImpression.classificationScore ? `- Classificação / Score: ${currentReport.diagnosticImpression.classificationScore}\n` : ''}- Diagnósticos Diferenciais: ${currentReport.diagnosticImpression.differentialDiagnoses.join('; ')}
- Evolução Comparativa: ${currentReport.diagnosticImpression.comparativeEvolution || 'N/A'}

4. ESTRATIFICAÇÃO DE RISCO & GRAVIDADE:
- Nível: ${t.urgency[currentReport.urgencyLevel]}
- Justificativa: ${currentReport.urgencyRationale}
- Conduta Imediata Sugerida: ${currentReport.riskStratification.actionRecommendation}

5. ESPECIALISTAS RECOMENDADOS PARA ENCAMINHAMENTO:
${currentReport.recommendedSpecialists.map((s) => `• ${s.specialty} [Prazo: ${s.timeframe}]: ${s.rationale}`).join('\n')}

6. EXAMES COMPLEMENTARES SUGERIDOS:
${currentReport.complementaryExams.map((e) => `• ${e.examName} (${e.urgency}): ${e.clinicalJustification}`).join('\n')}

7. EMBASAMENTO EM LITERATURA MÉDICA:
${currentReport.medicalLiterature.map((l) => `• ${l.guidelineOrStudy} (${l.organizationOrJournal}, ${l.year}) [${l.evidenceLevel}]: ${l.summaryOfEvidence}`).join('\n')}

------------------------------------------------------
ASSINATURA:
${physicianName} - ${physicianCRM}
Laudo emitido com suporte de RadIA (Diretrizes Internacionais de Ultrassonografia).
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
      patient: localizedPatient,
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
      signedByRadiologist: true,
      updatedAt: new Date().toISOString(),
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
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-800 dark:text-cyan-400 block">
                {t.report.docKicker}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                {t.report.docTitle}
              </h1>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>
                  {t.report.patient}: <strong className="text-slate-800 dark:text-slate-200">{localizedPatient.name}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {localizedPatient.age} {t.report.years} ({genderLabel})
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">
                  {t.report.record}: {localizedPatient.recordNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <BadgeUrgency level={currentReport.urgencyLevel} size="md" />
              <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                {new Date(currentReport.createdAt).toLocaleDateString(locale)} {t.report.at}{' '}
                {new Date(currentReport.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
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

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.report.diffDiag}</span>
              <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-0.5 mt-0.5">
                {currentReport.diagnosticImpression.differentialDiagnoses.map((diff, i) => (
                  <li key={i}>{diff}</li>
                ))}
              </ul>
            </div>

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

        {/* 4. RISK & SEVERITY STRATIFICATION */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5">
            {t.report.sec4}
          </h2>
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <BadgeUrgency level={currentReport.urgencyLevel} size="md" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {currentReport.urgencyRationale}
              </span>
            </div>

            {currentReport.riskStratification.clinicalFlags &&
              currentReport.riskStratification.clinicalFlags.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.report.redFlags}</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {currentReport.riskStratification.clinicalFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                      >
                        · {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {t.report.immediateAction}
              </span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={editableReport.riskStratification.actionRecommendation}
                  onChange={(e) =>
                    setEditableReport((prev) => ({
                      ...prev,
                      riskStratification: {
                        ...prev.riskStratification,
                        actionRecommendation: e.target.value,
                      },
                    }))
                  }
                  className="w-full mt-1 text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              ) : (
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                  {currentReport.riskStratification.actionRecommendation}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 5. RECOMMENDED SPECIALISTS */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.report.sec5}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentReport.recommendedSpecialists.map((spec, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-1">
                  <span>{spec.specialty}</span>
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-teal-800 dark:text-cyan-300">
                    {spec.timeframe}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {spec.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. COMPLEMENTARY EXAMS */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5">
            {t.report.sec6}
          </h2>
          <div className="space-y-2">
            {currentReport.complementaryExams.map((exam, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                  <span>{exam.examName}</span>
                  <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">
                    {exam.urgency}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  <strong>{t.report.clinicalJustification}:</strong> {exam.clinicalJustification}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 7. MEDICAL LITERATURE */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-bold text-teal-800 dark:text-cyan-400 mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.report.sec7}</span>
          </h2>
          <div className="space-y-2">
            {currentReport.medicalLiterature.map((lit, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                  <span className="text-teal-800 dark:text-cyan-400">{lit.guidelineOrStudy}</span>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">{lit.year}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>{lit.organizationOrJournal}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{lit.evidenceLevel}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {lit.summaryOfEvidence}
                </p>
              </div>
            ))}
          </div>
        </div>

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
