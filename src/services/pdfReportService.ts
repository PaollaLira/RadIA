import { jsPDF } from 'jspdf';
import { StandardizedRadiologyReport } from '../types/report';
import { Patient } from '../types/patient';
import { UltrasoundExam } from '../types/ultrasound';
import { AppLanguage } from '../i18n/translations';

/**
 * Normaliza símbolos especiais que não existem na tabela WinAnsi padrão das fontes embutidas do jsPDF,
 * preservando integralmente os acentos do português e do espanhol.
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

function tr(lang: AppLanguage, pt: string, en: string, es: string): string {
  return lang === 'en' ? en : lang === 'es' ? es : pt;
}

function formatBirthDateForPdf(
  birthDate: string | undefined,
  locale: string
): string {
  if (!birthDate) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    const [y, m, d] = birthDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(locale);
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthDate)) {
    const [d, m, y] = birthDate.split('/').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(locale);
  }
  return birthDate;
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
    const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR';

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
      tr(
        lang,
        'CENTRO DE DIAGNÓSTICO POR IMAGEM',
        'DIAGNOSTIC IMAGING CENTER',
        'CENTRO DE DIAGNÓSTICO POR IMAGEN'
      ),
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
      sanitizeForPdf(
        `${tr(lang, 'Emissão', 'Issued', 'Emisión')}: ${examDateFormatted}`
      ),
      pageWidth - marginX,
      cursorY,
      { align: 'right' }
    );
    cursorY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...SLATE_900);
    doc.text(
      tr(
        lang,
        'Laudo Médico de Ultrassonografia',
        'Diagnostic Ultrasound Medical Report',
        'Informe Médico de Ultrasonografía'
      ),
      marginX,
      cursorY
    );
    cursorY += 5.5;

    // Destaque do Exame Realizado
    const examTitleLines = doc.splitTextToSize(
      sanitizeForPdf(
        `${tr(
          lang,
          'EXAME REALIZADO',
          'EXAM PERFORMED',
          'ESTUDIO REALIZADO'
        )}: ${report.technique.protocolName.toUpperCase()}`
      ),
      contentWidth - 6
    ) as string[];
    const examBannerHeight = 4.5 + examTitleLines.length * 4.5;
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(...TEAL);
    doc.setLineWidth(0.35);
    doc.roundedRect(marginX, cursorY, contentWidth, examBannerHeight, 1.5, 1.5, 'FD');
    doc.setFillColor(...TEAL);
    doc.rect(marginX, cursorY, 1.6, examBannerHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.8);
    doc.setTextColor(...TEAL);
    let bannerTextY = cursorY + 4.8;
    for (const line of examTitleLines) {
      doc.text(line, marginX + 4, bannerTextY);
      bannerTextY += 4.5;
    }
    cursorY += examBannerHeight + 4;

    // Caixa de Identificação do Paciente
    const formattedBirthDate = formatBirthDateForPdf(patient.birthDate, locale);
    const hasDocMeta = Boolean(patient.cpf?.trim() || formattedBirthDate);
    const boxStartY = cursorY;
    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...BORDER_GRAY);
    doc.setLineWidth(0.25);

    const boxHeight = hasDocMeta ? 17.5 : 13;

    doc.roundedRect(marginX, boxStartY, contentWidth, boxHeight, 2, 2, 'FD');
    cursorY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...SLATE_900);
    doc.text(
      sanitizeForPdf(
        `${tr(lang, 'Paciente', 'Patient', 'Paciente')}: ${
          patient.name ||
          tr(lang, 'Não informado', 'Not specified', 'No especificado')
        }`
      ),
      marginX + 3,
      cursorY
    );
    cursorY += 4.8;

    const genderText =
      patient.gender === 'M'
        ? tr(lang, 'Masculino', 'Male', 'Masculino')
        : patient.gender === 'F'
        ? tr(lang, 'Feminino', 'Female', 'Femenino')
        : tr(lang, 'Outro', 'Other', 'Otro');

    const metaParts: string[] = [];
    if (patient.age > 0) {
      metaParts.push(
        `${tr(lang, 'Idade', 'Age', 'Edad')}: ${patient.age} ${tr(
          lang,
          'anos',
          'yrs',
          'años'
        )}`
      );
    }
    metaParts.push(`${tr(lang, 'Sexo', 'Sex', 'Sexo')}: ${genderText}`);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...SLATE_500);
    doc.text(sanitizeForPdf(metaParts.join('  |  ')), marginX + 3, cursorY);

    if (hasDocMeta) {
      cursorY += 4.4;
      const docParts: string[] = [];
      if (patient.cpf?.trim()) {
        docParts.push(`${tr(lang, 'CPF', 'ID / CPF', 'CPF / Doc.')}: ${patient.cpf.trim()}`);
      }
      if (formattedBirthDate) {
        docParts.push(
          `${tr(lang, 'Data de Nascimento', 'Date of Birth', 'Fecha de Nacimiento')}: ${formattedBirthDate}`
        );
      }
      doc.text(sanitizeForPdf(docParts.join('  |  ')), marginX + 3, cursorY);
    }

    cursorY = boxStartY + boxHeight + 4;

    // ========================
    // REGISTRO FOTOGRÁFICO ECOGRÁFICO
    // ========================
    if (imageDataUrl) {
      const normalized = await normalizeImageToJpeg(imageDataUrl);
      if (normalized) {
        drawSectionHeader(
          tr(
            lang,
            'Registro Fotográfico Ecográfico',
            'Ultrasound Photographic Record',
            'Registro Fotográfico Ecográfico'
          )
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
      tr(
        lang,
        '1. Técnica e Protocolo do Exame',
        '1. Technique and Exam Protocol',
        '1. Técnica y Protocolo del Estudio'
      )
    );
    writeLabelValue(
      tr(lang, 'Exame Realizado', 'Exam Performed', 'Estudio Realizado'),
      report.technique.protocolName
    );
    writeLabelValue(
      tr(lang, 'Transdutor', 'Transducer', 'Transductor'),
      report.technique.transducerType
    );
    writeLabelValue(
      tr(lang, 'Janelas Acústicas', 'Acoustic Windows', 'Ventanas Acústicas'),
      report.technique.acousticWindows
    );
    writeLabelValue(
      tr(lang, 'Preparo do Paciente', 'Patient Preparation', 'Preparación del Paciente'),
      report.technique.patientPreparation
    );
    if (report.technique.technicalLimitations) {
      writeLabelValue(
        tr(lang, 'Condições Técnicas', 'Technical Conditions', 'Condiciones Técnicas'),
        report.technique.technicalLimitations
      );
    }

    // ========================
    // 2. ACHADOS RADIOLÓGICOS
    // ========================
    drawSectionHeader(
      tr(
        lang,
        '2. Achados Radiológicos Detalhados',
        '2. Detailed Radiological Findings',
        '2. Hallazgos Radiológicos Detallados'
      )
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
      tr(
        lang,
        '3. Impressão Diagnóstica',
        '3. Diagnostic Impression',
        '3. Impresión Diagnóstica'
      )
    );
    writeLabelValue(
      tr(lang, 'Diagnóstico Principal', 'Primary Diagnosis', 'Diagnóstico Principal'),
      report.diagnosticImpression.primaryDiagnosis
    );
    if (report.diagnosticImpression.classificationScore) {
      writeLabelValue(
        tr(lang, 'Classificação / Escore', 'Score / Classification', 'Clasificación / Escala'),
        report.diagnosticImpression.classificationScore
      );
    }
    if (report.diagnosticImpression.differentialDiagnoses.length > 0) {
      writeWrappedText(
        tr(
          lang,
          'Diagnósticos Diferenciais:',
          'Differential Diagnoses:',
          'Diagnósticos Diferenciales:'
        ),
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
        tr(
          lang,
          'Comparação com Histórico Anterior',
          'Prior History Comparison',
          'Comparación con Antecedentes Previos'
        ),
        report.diagnosticImpression.comparativeEvolution
      );
    }

    // ========================
    // 4. REFERÊNCIAS MÉDICAS
    // ========================
    if (report.medicalLiterature.length > 0) {
      drawSectionHeader(
        tr(
          lang,
          '4. Referências Médicas',
          '4. Medical References',
          '4. Referencias Médicas'
        )
      );
      report.medicalLiterature.forEach((lit) => {
        writeWrappedText(
          `${lit.guidelineOrStudy} (${lit.organizationOrJournal}, ${lit.year})`,
          {
            fontSize: 9,
            bold: true,
            color: TEAL,
            spacingAfter: 0.5,
          }
        );
        writeWrappedText(lit.summaryOfEvidence, {
          fontSize: 8.6,
          indent: 2,
          spacingAfter: 1.5,
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
        tr(
          lang,
          'UltrAI Med - Copiloto de Ultrassonografia | Documento de apoio ao diagnóstico médico baseado em diretrizes.',
          'UltrAI Med - Ultrasound Diagnostic Copilot | Evidence-based clinical decision support.',
          'UltrAI Med - Copiloto de Ultrasonografía | Apoyo al diagnóstico médico basado en evidencia.'
        ),
        marginX,
        pageHeight - 8.5
      );
      doc.text(
        `${tr(lang, 'Página', 'Page', 'Página')} ${i} ${tr(
          lang,
          'de',
          'of',
          'de'
        )} ${totalPages}`,
        pageWidth - marginX,
        pageHeight - 8.5,
        { align: 'right' }
      );
    }

    const safeName = slugifyName(patient.name || 'Paciente');
    const datePart = new Date(report.createdAt).toISOString().slice(0, 10);
    const prefix = tr(lang, 'Laudo_USG', 'USG_Report', 'Informe_USG');

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
    const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR';

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
      tr(
        lang,
        'UltrAI Med - Resumo de Plantão e Triagem USG',
        'UltrAI Med - Shift & Ultrasound Triage Summary',
        'UltrAI Med - Resumen de Guardia y Triaje USG'
      ),
      marginX,
      cursorY
    );
    cursorY += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE_500);
    doc.text(
      sanitizeForPdf(
        `${tr(lang, 'Gerado em', 'Generated on', 'Generado el')} ${new Date().toLocaleDateString(
          locale
        )} | ${tr(lang, 'Total de exames', 'Total exams', 'Total de estudios')}: ${exams.length}`
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
          `${idx + 1}. ${patient.name} (${patient.age} ${tr(
            lang,
            'anos',
            'yrs',
            'años'
          )})`
        ),
        marginX,
        cursorY
      );
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(...SLATE_700);
      const summaryLine = rep
        ? `${tr(lang, 'Impressão', 'Impression', 'Impresión')}: ${
            rep.diagnosticImpression.primaryDiagnosis
          }`
        : `${tr(lang, 'Exame', 'Exam', 'Estudio')}: ${
            exam.specialty || tr(lang, 'Geral', 'General', 'General')
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
      `${tr(
        lang,
        'Resumo_Plantao_UltrAI_Med',
        'UltrAI_Med_Shift_Summary',
        'Resumen_Guardia_UltrAI_Med'
      )}_${datePart}.pdf`
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
    a.download = `${tr(
      lang,
      'Ultrassom',
      'Ultrasound',
      'Ultrasonido'
    )}_${safeName}_${datePart}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}
