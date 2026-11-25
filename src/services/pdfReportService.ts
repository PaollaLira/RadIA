import { jsPDF } from 'jspdf';
import { StandardizedRadiologyReport } from '../types/report';
import { Patient } from '../types/patient';
import { UltrasoundExam } from '../types/ultrasound';
import { AppLanguage } from '../i18n/translations';

/**
 * Normaliza símbolos especiais que não existem na tabela WinAnsi padrão das fontes embutidas do jsPDF,
 * preservando integralmente os acentos da língua portuguesa (ç, ã, õ, á, é, í, ó, ú, ê, ô).
 */
function sanitizeForPdf(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/·/g, ' - ')
    .replace(/•/g, '-')
    .replace(/→/g, '->')
    .replace(/®/g, '(R)')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '-');
}

async function normalizeImageToJpeg(
  imageDataUrl: string
): Promise<{ jpegDataUrl: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width || 800;
      canvas.height = img.naturalHeight || img.height || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({
        jpegDataUrl: canvas.toDataURL('image/jpeg', 0.92),
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.onerror = () => resolve(null);
    img.src = imageDataUrl;
  });
}

function slugifyName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export class PdfReportService {
  /**
   * Exporta o laudo completo em PDF A4 (com a imagem ecográfica anexada, caso exista).
   */
  public static async exportReportToPdf(params: {
    report: StandardizedRadiologyReport;
    patient: Patient;
    physicianName: string;
    physicianCRM: string;
    imageDataUrl?: string | null;
    lang?: AppLanguage;
  }): Promise<void> {
    const {
      report,
      patient,
      physicianName,
      physicianCRM,
      imageDataUrl,
      lang = 'pt',
    } = params;
    const isEn = lang === 'en';
    const locale = isEn ? 'en-US' : 'pt-BR';

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 16;
    const contentWidth = pageWidth - marginX * 2;
    const bottomMargin = 20;
    let cursorY = 16;

    const TEAL: [number, number, number] = [11, 79, 94];
    const SLATE_900: [number, number, number] = [15, 23, 42];
    const SLATE_700: [number, number, number] = [51, 65, 85];
    const SLATE_500: [number, number, number] = [100, 116, 139];
    const BORDER_GRAY: [number, number, number] = [203, 213, 225];
    const LIGHT_BG: [number, number, number] = [248, 250, 252];

    const ensureSpace = (requiredHeight: number) => {
      if (cursorY + requiredHeight > pageHeight - bottomMargin) {
        doc.addPage();
        cursorY = 18;
      }
    };

    const drawSectionHeader = (title: string) => {
      ensureSpace(12);
      cursorY += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...TEAL);
      doc.text(sanitizeForPdf(title.toUpperCase()), marginX, cursorY);
      cursorY += 1.8;
      doc.setDrawColor(...TEAL);
      doc.setLineWidth(0.35);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += 4.5;
    };

    const writeWrappedText = (
      text: string,
      options?: {
        fontSize?: number;
        bold?: boolean;
        italic?: boolean;
        color?: [number, number, number];
        indent?: number;
        lineHeight?: number;
        spacingAfter?: number;
      }
    ) => {
      const fontSize = options?.fontSize ?? 9.5;
      const indent = options?.indent ?? 0;
      const lineHeight = options?.lineHeight ?? fontSize * 0.46;
      const spacingAfter = options?.spacingAfter ?? 2;
      const style = options?.bold
        ? 'bold'
        : options?.italic
        ? 'italic'
        : 'normal';

      doc.setFont('helvetica', style);
      doc.setFontSize(fontSize);
      doc.setTextColor(...(options?.color ?? SLATE_700));

      const lines = doc.splitTextToSize(
        sanitizeForPdf(text),
        contentWidth - indent
      ) as string[];

      for (const line of lines) {
        ensureSpace(lineHeight + 1);
        doc.text(line, marginX + indent, cursorY);
        cursorY += lineHeight;
      }
      cursorY += spacingAfter;
    };

    const writeLabelValue = (label: string, value: string, indent = 0) => {
      const fullText = `${label}: ${value}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      const labelText = sanitizeForPdf(`${label}: `);
      const labelWidth = doc.getTextWidth(labelText);

      const wrappedAll = doc.splitTextToSize(
        sanitizeForPdf(fullText),
        contentWidth - indent
      ) as string[];

      const lineHeight = 4.4;
      ensureSpace(wrappedAll.length * lineHeight + 1.5);

      if (wrappedAll.length === 1) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...SLATE_900);
        doc.text(labelText, marginX + indent, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...SLATE_700);
        doc.text(
          sanitizeForPdf(value),
          marginX + indent + labelWidth,
          cursorY
        );
        cursorY += lineHeight + 1;
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...SLATE_900);
        doc.text(labelText, marginX + indent, cursorY);
        cursorY += lineHeight;
        writeWrappedText(value, {
          fontSize: 9.2,
          indent: indent + 2,
          spacingAfter: 1.5,
        });
      }
    };

    // ========================
    // CABEÇALHO INSTITUCIONAL
    // ========================
    doc.setFillColor(...TEAL);
    doc.rect(marginX, cursorY, contentWidth, 1.5, 'F');
    cursorY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...TEAL);
    doc.text(
      isEn
        ? 'DIAGNOSTIC IMAGING CENTER - ULTRASOUND MEDICAL REPORT'
        : 'CENTRO DE DIAGNÓSTICO POR IMAGEM - RELATÓRIO DE ULTRASSONOGRAFIA',
      marginX,
      cursorY
    );

    const examDateFormatted = new Date(report.createdAt).toLocaleDateString(
      locale
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...SLATE_500);
    doc.text(
      sanitizeForPdf(`${isEn ? 'Issued' : 'Emissão'}: ${examDateFormatted}`),
      pageWidth - marginX,
      cursorY,
      { align: 'right' }
    );
    cursorY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...SLATE_900);
    doc.text(
      isEn
        ? 'Diagnostic Ultrasound Medical Report'
        : 'Laudo Médico de Ultrassonografia',
      marginX,
      cursorY
    );
    cursorY += 6;

    // Caixa de Identificação do Paciente
    const boxStartY = cursorY;
    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...BORDER_GRAY);
    doc.setLineWidth(0.25);

    const indicationLines = patient.clinicalIndication?.trim()
      ? (doc.splitTextToSize(
          sanitizeForPdf(
            `${isEn ? 'Clinical Indication' : 'Indicação Clínica'}: ${
              patient.clinicalIndication
            }`
          ),
          contentWidth - 6
        ) as string[])
      : [];
    const boxHeight = indicationLines.length > 0 ? 14 + indicationLines.length * 4.2 : 13;

    doc.roundedRect(marginX, boxStartY, contentWidth, boxHeight, 2, 2, 'FD');
    cursorY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...SLATE_900);
    doc.text(
      sanitizeForPdf(
        `${isEn ? 'Patient' : 'Paciente'}: ${
          patient.name || (isEn ? 'Not specified' : 'Não informado')
        }`
      ),
      marginX + 3,
      cursorY
    );
    cursorY += 4.8;

    const genderText = isEn
      ? patient.gender === 'M'
        ? 'Male'
        : patient.gender === 'F'
        ? 'Female'
        : patient.gender
      : patient.gender === 'M'
      ? 'Masculino'
      : patient.gender === 'F'
      ? 'Feminino'
      : patient.gender;

    const metaParts: string[] = [];
    if (patient.age > 0) {
      metaParts.push(`${isEn ? 'Age' : 'Idade'}: ${patient.age} ${isEn ? 'yrs' : 'anos'}`);
    }
    metaParts.push(`${isEn ? 'Sex' : 'Sexo'}: ${genderText}`);
    if (patient.roomBed) {
      metaParts.push(`${isEn ? 'Ward/Bed' : 'Setor/Leito'}: ${patient.roomBed}`);
    }

    doc.setFontSize(8.8);
    doc.setTextColor(...SLATE_500);
    doc.text(sanitizeForPdf(metaParts.join('  |  ')), marginX + 3, cursorY);
    cursorY += 4.8;

    if (indicationLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(...SLATE_700);
      for (const line of indicationLines) {
        doc.text(line, marginX + 3, cursorY);
        cursorY += 4.2;
      }
    }
    cursorY = boxStartY + boxHeight + 4;

    // ========================
    // REGISTRO FOTOGRÁFICO ECOGRÁFICO
    // ========================
    if (imageDataUrl) {
      const normalized = await normalizeImageToJpeg(imageDataUrl);
      if (normalized) {
        drawSectionHeader(
          isEn
            ? 'Ultrasound Photographic Record'
            : 'Registro Fotográfico Ecográfico'
        );
        const maxImgWidth = contentWidth * 0.72;
        const maxImgHeight = 68;
        const ratio = Math.min(
          maxImgWidth / normalized.width,
          maxImgHeight / normalized.height
        );
        const drawW = normalized.width * ratio;
        const drawH = normalized.height * ratio;
        ensureSpace(drawH + 8);
        const imgX = marginX + (contentWidth - drawW) / 2;

        doc.setDrawColor(...BORDER_GRAY);
        doc.setLineWidth(0.3);
        doc.rect(imgX - 1, cursorY - 1, drawW + 2, drawH + 2);
        doc.addImage(normalized.jpegDataUrl, 'JPEG', imgX, cursorY, drawW, drawH);
        cursorY += drawH + 5;
      }
    }

    // ========================
    // 1. TÉCNICA E PROTOCOLO
    // ========================
    drawSectionHeader(
      isEn ? '1. Technique and Exam Protocol' : '1. Técnica e Protocolo do Exame'
    );
    writeLabelValue(
      isEn ? 'Exam Performed' : 'Exame Realizado',
      report.technique.protocolName
    );
    writeLabelValue(
      isEn ? 'Transducer' : 'Transdutor',
      report.technique.transducerType
    );
    writeLabelValue(
      isEn ? 'Acoustic Windows' : 'Janelas Acústicas',
      report.technique.acousticWindows
    );
    writeLabelValue(
      isEn ? 'Patient Preparation' : 'Preparo do Paciente',
      report.technique.patientPreparation
    );
    if (report.technique.technicalLimitations) {
      writeLabelValue(
        isEn ? 'Technical Conditions' : 'Condições Técnicas',
        report.technique.technicalLimitations
      );
    }

    // ========================
    // 2. ACHADOS RADIOLÓGICOS
    // ========================
    drawSectionHeader(
      isEn
        ? '2. Detailed Radiological Findings'
        : '2. Achados Radiológicos Detalhados'
    );
    report.findings.forEach((finding) => {
      ensureSpace(12);
      const header = finding.measurements
        ? `${finding.region} (${finding.measurements})`
        : finding.region;
      writeWrappedText(header, {
        fontSize: 9.5,
        bold: true,
        color: SLATE_900,
        spacingAfter: 0.8,
      });
      writeWrappedText(finding.description, {
        fontSize: 9.2,
        indent: 2,
        spacingAfter: 2.5,
      });
    });

    // ========================
    // 3. IMPRESSÃO DIAGNÓSTICA
    // ========================
    drawSectionHeader(
      isEn
        ? '3. Diagnostic Impression and Differential Diagnosis'
        : '3. Impressão Diagnóstica e Diagnóstico Diferencial'
    );
    writeLabelValue(
      isEn ? 'Primary Diagnosis' : 'Diagnóstico Principal',
      report.diagnosticImpression.primaryDiagnosis
    );
    if (report.diagnosticImpression.classificationScore) {
      writeLabelValue(
        isEn ? 'Score / Classification' : 'Classificação / Escore',
        report.diagnosticImpression.classificationScore
      );
    }
    if (report.diagnosticImpression.differentialDiagnoses.length > 0) {
      writeWrappedText(
        isEn ? 'Differential Diagnoses:' : 'Diagnósticos Diferenciais:',
        {
          fontSize: 9.2,
          bold: true,
          color: SLATE_900,
          spacingAfter: 0.8,
        }
      );
      report.diagnosticImpression.differentialDiagnoses.forEach((diff) => {
        writeWrappedText(`- ${diff}`, {
          fontSize: 9,
          indent: 3,
          spacingAfter: 0.8,
        });
      });
      cursorY += 1;
    }
    if (report.diagnosticImpression.comparativeEvolution) {
      writeLabelValue(
        isEn ? 'Prior History Comparison' : 'Comparação com Histórico Anterior',
        report.diagnosticImpression.comparativeEvolution
      );
    }

    // ========================
    // 4. ESTRATIFICAÇÃO DE RISCO
    // ========================
    drawSectionHeader(
      isEn
        ? '4. Risk and Severity Stratification'
        : '4. Estratificação de Risco e Gravidade'
    );
    writeLabelValue(
      isEn ? 'Rationale' : 'Justificativa',
      report.urgencyRationale
    );
    if (
      report.riskStratification.clinicalFlags &&
      report.riskStratification.clinicalFlags.length > 0
    ) {
      writeLabelValue(
        isEn ? 'Clinical Red Flags' : 'Sinais de Alerta',
        report.riskStratification.clinicalFlags.join('; ')
      );
    }
    writeLabelValue(
      isEn ? 'Immediate Recommended Management' : 'Conduta Imediata Sugerida',
      report.riskStratification.actionRecommendation
    );

    // ========================
    // 5. ESPECIALISTAS RECOMENDADOS
    // ========================
    if (report.recommendedSpecialists.length > 0) {
      drawSectionHeader(
        isEn
          ? '5. Recommended Specialist Referrals'
          : '5. Especialistas Recomendados para Encaminhamento'
      );
      report.recommendedSpecialists.forEach((spec) => {
        writeWrappedText(`${spec.specialty} [${spec.timeframe}]`, {
          fontSize: 9.2,
          bold: true,
          color: SLATE_900,
          spacingAfter: 0.6,
        });
        writeWrappedText(spec.rationale, {
          fontSize: 9,
          indent: 2,
          spacingAfter: 2,
        });
      });
    }

    // ========================
    // 6. EXAMES COMPLEMENTARES
    // ========================
    if (report.complementaryExams.length > 0) {
      drawSectionHeader(
        isEn
          ? '6. Suggested Complementary Exams and Workup'
          : '6. Exames Complementares Sugeridos e Conduta'
      );
      report.complementaryExams.forEach((examItem) => {
        writeWrappedText(`${examItem.examName} (${examItem.urgency})`, {
          fontSize: 9.2,
          bold: true,
          color: SLATE_900,
          spacingAfter: 0.6,
        });
        writeWrappedText(
          `${isEn ? 'Justification' : 'Justificativa'}: ${
            examItem.clinicalJustification
          }`,
          {
            fontSize: 9,
            indent: 2,
            spacingAfter: 2,
          }
        );
      });
    }

    // ========================
    // 7. LITERATURA MÉDICA
    // ========================
    if (report.medicalLiterature.length > 0) {
      drawSectionHeader(
        isEn
          ? '7. Medical Literature and Updated Guidelines'
          : '7. Embasamento em Literatura Médica e Diretrizes Atualizadas'
      );
      report.medicalLiterature.forEach((lit) => {
        writeWrappedText(
          `${lit.guidelineOrStudy} (${lit.organizationOrJournal}, ${lit.year}) - ${lit.evidenceLevel}`,
          {
            fontSize: 9,
            bold: true,
            color: TEAL,
            spacingAfter: 0.6,
          }
        );
        writeWrappedText(lit.summaryOfEvidence, {
          fontSize: 8.8,
          indent: 2,
          spacingAfter: 2,
        });
      });
    }

    // ========================
    // ASSINATURA MÉDICA
    // ========================
    ensureSpace(24);
    cursorY += 8;
    doc.setDrawColor(...BORDER_GRAY);
    doc.setLineWidth(0.3);
    doc.line(marginX, cursorY, marginX + 85, cursorY);
    cursorY += 4.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE_900);
    doc.text(sanitizeForPdf(physicianName), marginX, cursorY);
    cursorY += 4.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_500);
    doc.text(sanitizeForPdf(physicianCRM), marginX, cursorY);

    // ========================
    // RODAPÉ EM TODAS AS PÁGINAS
    // ========================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...BORDER_GRAY);
      doc.setLineWidth(0.2);
      doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...SLATE_500);
      doc.text(
        isEn
          ? 'UltrAI Med - Ultrasound Diagnostic Copilot | Evidence-based clinical decision support.'
          : 'UltrAI Med - Copiloto de Ultrassonografia | Documento de apoio ao diagnóstico médico baseado em diretrizes.',
        marginX,
        pageHeight - 8.5
      );
      doc.text(
        `${isEn ? 'Page' : 'Página'} ${i} ${isEn ? 'of' : 'de'} ${totalPages}`,
        pageWidth - marginX,
        pageHeight - 8.5,
        { align: 'right' }
      );
    }

    const safeName = slugifyName(patient.name);
    const datePart = new Date(report.createdAt).toISOString().slice(0, 10);
    const prefix = isEn ? 'USG_Report' : 'Laudo_USG';

    doc.save(`${prefix}_${safeName}_${datePart}.pdf`);
  }

  /**
   * Exporta um resumo consolidado do plantão / worklist em PDF A4.
   */
  public static exportShiftSummaryPdf(params: {
    patients: Patient[];
    exams: UltrasoundExam[];
    reports: Record<string, StandardizedRadiologyReport>;
    lang?: AppLanguage;
  }): void {
    const { patients, exams, reports, lang = 'pt' } = params;
    const isEn = lang === 'en';
    const locale = isEn ? 'en-US' : 'pt-BR';

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 16;
    const contentWidth = pageWidth - marginX * 2;
    let cursorY = 18;

    const TEAL: [number, number, number] = [11, 79, 94];
    const SLATE_900: [number, number, number] = [15, 23, 42];
    const SLATE_700: [number, number, number] = [51, 65, 85];
    const SLATE_500: [number, number, number] = [100, 116, 139];

    doc.setFillColor(...TEAL);
    doc.rect(marginX, 14, contentWidth, 1.5, 'F');
    cursorY = 21;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...SLATE_900);
    doc.text(
      isEn
        ? 'UltrAI Med - Shift & Ultrasound Triage Summary'
        : 'UltrAI Med - Resumo de Plantão e Triagem USG',
      marginX,
      cursorY
    );
    cursorY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_500);
    doc.text(
      sanitizeForPdf(
        `${isEn ? 'Generated on' : 'Gerado em'} ${new Date().toLocaleDateString(
          locale
        )} | ${isEn ? 'Total exams' : 'Total de exames'}: ${exams.length}`
      ),
      marginX,
      cursorY
    );
    cursorY += 8;

    exams.forEach((exam, idx) => {
      const patient = patients.find((p) => p.id === exam.patientId);
      if (!patient) return;
      const rep = reports[exam.id];

      if (cursorY > pageHeight - 36) {
        doc.addPage();
        cursorY = 18;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...SLATE_900);
      doc.text(
        sanitizeForPdf(
          `${idx + 1}. ${patient.name} (${patient.age} ${
            isEn ? 'yrs' : 'anos'
          })`
        ),
        marginX,
        cursorY
      );
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(...SLATE_700);
      const summaryLine = rep
        ? `${isEn ? 'Impression' : 'Impressão'}: ${
            rep.diagnosticImpression.primaryDiagnosis
          }`
        : `${isEn ? 'Indication' : 'Indicação'}: ${
            patient.clinicalIndication
          } (Status: ${exam.status})`;
      const wrapped = doc.splitTextToSize(
        sanitizeForPdf(summaryLine),
        contentWidth - 4
      ) as string[];
      for (const line of wrapped) {
        doc.text(line, marginX + 2, cursorY);
        cursorY += 4.2;
      }

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(marginX, cursorY + 1, pageWidth - marginX, cursorY + 1);
      cursorY += 5.5;
    });

    const datePart = new Date().toISOString().slice(0, 10);
    doc.save(
      `${isEn ? 'UltrAI_Med_Shift_Summary' : 'Resumo_Plantao_UltrAI_Med'}_${datePart}.pdf`
    );
  }

  /**
   * Converte qualquer imagem do exame para JPEG (.jpg) e inicia o download no dispositivo.
   */
  public static async downloadImageAsJpeg(
    imageDataUrl: string,
    patientName: string,
    lang: AppLanguage = 'pt'
  ): Promise<boolean> {
    const normalized = await normalizeImageToJpeg(imageDataUrl);
    if (!normalized) return false;

    const a = document.createElement('a');
    a.href = normalized.jpegDataUrl;
    const safeName = slugifyName(patientName || 'Exam');
    const datePart = new Date().toISOString().slice(0, 10);
    a.download = `${
      lang === 'en' ? 'Ultrasound' : 'Ultrassom'
    }_${safeName}_${datePart}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}
