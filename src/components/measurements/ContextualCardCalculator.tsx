import React, { useState } from 'react';
import { CalculatorType } from '../../data/usgReferenceMeasurements';
import { AppLanguage } from '../../i18n/translations';
import {
  Check,
  Copy,
  X,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Scale,
} from 'lucide-react';

interface ContextualCardCalculatorProps {
  calculatorType: CalculatorType;
  organTitle: string;
  lang: AppLanguage;
  volMin?: number;
  volMax?: number;
  volUnit?: string;
  density?: number;
  contextLabel?: string;
}

const EFW_GA_ANCHORS: Array<{ week: number; grams: number }> = [
  { week: 15, grams: 117 },
  { week: 16, grams: 146 },
  { week: 18, grams: 223 },
  { week: 20, grams: 331 },
  { week: 22, grams: 478 },
  { week: 24, grams: 670 },
  { week: 26, grams: 913 },
  { week: 28, grams: 1210 },
  { week: 30, grams: 1559 },
  { week: 32, grams: 1953 },
  { week: 34, grams: 2377 },
  { week: 36, grams: 2813 },
  { week: 38, grams: 3236 },
  { week: 40, grams: 3619 },
];

function estimateGaFromWeight(grams: number): string | null {
  if (!Number.isFinite(grams) || grams < 90 || grams > 4500) return null;
  if (grams <= EFW_GA_ANCHORS[0].grams) return '~15s';
  const last = EFW_GA_ANCHORS[EFW_GA_ANCHORS.length - 1];
  if (grams >= last.grams) return '≥ 40s';

  for (let i = 0; i < EFW_GA_ANCHORS.length - 1; i++) {
    const a = EFW_GA_ANCHORS[i];
    const b = EFW_GA_ANCHORS[i + 1];
    if (grams >= a.grams && grams <= b.grams) {
      const ratio = (grams - a.grams) / (b.grams - a.grams);
      const exactWeeks = a.week + ratio * (b.week - a.week);
      const wholeWeeks = Math.floor(exactWeeks);
      const days = Math.round((exactWeeks - wholeWeeks) * 7);
      return `${wholeWeeks}s${days > 0 ? `${days}d` : ''}`;
    }
  }
  return null;
}

function parseNum(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const ContextualCardCalculator: React.FC<ContextualCardCalculatorProps> = ({
  calculatorType,
  organTitle,
  lang,
  volMin,
  volMax,
  volUnit = 'cm³',
  density,
  contextLabel,
}) => {
  const tr = (pt: string, en: string, es: string) =>
    lang === 'en' ? en : lang === 'es' ? es : pt;

  const defaultUnit: 'mm' | 'cm' =
    calculatorType === 'fetal_weight' ||
    calculatorType === 'thyroid' ||
    calculatorType === 'prostate'
      ? 'mm'
      : 'cm';

  const [unit, setUnit] = useState<'mm' | 'cm'>(defaultUnit);
  const [copied, setCopied] = useState(false);

  // Standard 3-axis (L x AP x T) & optional second set (Left thyroid lobe OR Post-void bladder)
  const [len1, setLen1] = useState('');
  const [ap1, setAp1] = useState('');
  const [tr1, setTr1] = useState('');
  const [len2, setLen2] = useState('');
  const [ap2, setAp2] = useState('');
  const [tr2, setTr2] = useState('');

  // Fetal weight biometry inputs
  const [bpd, setBpd] = useState('');
  const [hc, setHc] = useState('');
  const [ac, setAc] = useState('');
  const [fl, setFl] = useState('');

  const toCm = (v: number) => (unit === 'mm' ? v / 10 : v);
  const fmt = (n: number, dec = 1) =>
    lang === 'en'
      ? n.toFixed(dec)
      : n.toFixed(dec).replace('.', ',');

  const handleClear = () => {
    setLen1('');
    setAp1('');
    setTr1('');
    setLen2('');
    setAp2('');
    setTr2('');
    setBpd('');
    setHc('');
    setAc('');
    setFl('');
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const renderUnitHeader = (title: string, hasInputs: boolean) => (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
      <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-cyan-300">
        <Scale className="w-3.5 h-3.5 shrink-0" />
        <span>{title}</span>
        {contextLabel && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            · {contextLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="inline-flex rounded-md bg-slate-200/80 dark:bg-slate-800 p-0.5 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setUnit('mm')}
            className={`px-2 py-0.5 rounded transition-colors ${
              unit === 'mm'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            mm
          </button>
          <button
            type="button"
            onClick={() => setUnit('cm')}
            className={`px-2 py-0.5 rounded transition-colors ${
              unit === 'cm'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            cm
          </button>
        </div>

        {hasInputs && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title={tr('Limpar campos', 'Clear fields', 'Limpiar campos')}
            aria-label={tr('Limpar campos', 'Clear fields', 'Limpiar campos')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );

  const renderRangeStatus = (value: number, min?: number, max?: number, u = volUnit) => {
    if (min === undefined && max === undefined) return null;
    let status: 'low' | 'high' | 'normal' = 'normal';
    if (min !== undefined && value < min) status = 'low';
    else if (max !== undefined && value > max) status = 'high';

    if (status === 'low') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
          <ArrowDown className="w-3.5 h-3.5 shrink-0" />
          <span>
            {tr(
              `Abaixo da referência (< ${fmt(min!)} ${u})`,
              `Below reference (< ${fmt(min!)} ${u})`,
              `Por debajo de referencia (< ${fmt(min!)} ${u})`
            )}
          </span>
        </div>
      );
    }
    if (status === 'high') {
      return (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <ArrowUp className="w-3.5 h-3.5 shrink-0" />
          <span>
            {tr(
              `Acima da referência (> ${fmt(max!)} ${u})`,
              `Above reference (> ${fmt(max!)} ${u})`,
              `Por encima de referencia (> ${fmt(max!)} ${u})`
            )}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span>
          {min !== undefined && min > 0
            ? tr(
                `Dentro da referência (${fmt(min)}–${fmt(max!)} ${u})`,
                `Within reference (${fmt(min)}–${fmt(max!)} ${u})`,
                `Dentro de referencia (${fmt(min)}–${fmt(max!)} ${u})`
              )
            : tr(
                `Dentro da referência (≤ ${fmt(max!)} ${u})`,
                `Within reference (≤ ${fmt(max!)} ${u})`,
                `Dentro de referencia (≤ ${fmt(max!)} ${u})`
              )}
        </span>
      </div>
    );
  };

  // =========================================================================
  // 1. FETAL WEIGHT CALCULATOR (HADLOCK IV / III / II)
  // =========================================================================
  if (calculatorType === 'fetal_weight') {
    const vBpd = parseNum(bpd);
    const vHc = parseNum(hc);
    const vAc = parseNum(ac);
    const vFl = parseNum(fl);

    const bpdCm = vBpd ? toCm(vBpd) : null;
    const hcCm = vHc ? toCm(vHc) : null;
    const acCm = vAc ? toCm(vAc) : null;
    const flCm = vFl ? toCm(vFl) : null;

    let efwGrams: number | null = null;
    let formulaUsed = '';

    if (bpdCm && hcCm && acCm && flCm) {
      // Hadlock IV (1985): BPD, HC, AC, FL
      const log10Efw =
        1.3596 +
        0.0064 * hcCm +
        0.0424 * acCm +
        0.174 * flCm +
        0.00061 * bpdCm * acCm -
        0.00386 * acCm * flCm;
      efwGrams = Math.pow(10, log10Efw);
      formulaUsed = 'Hadlock IV (DBP + CC + CA + CF)';
    } else if (hcCm && acCm && flCm) {
      // Hadlock III (1985): HC, AC, FL
      const log10Efw =
        1.326 -
        0.00326 * acCm * flCm +
        0.0107 * hcCm +
        0.0438 * acCm +
        0.158 * flCm;
      efwGrams = Math.pow(10, log10Efw);
      formulaUsed = 'Hadlock III (CC + CA + CF)';
    } else if (bpdCm && acCm && flCm) {
      // Hadlock II (1985): BPD, AC, FL
      const log10Efw =
        1.335 -
        0.0034 * acCm * flCm +
        0.0316 * bpdCm +
        0.0457 * acCm +
        0.1623 * flCm;
      efwGrams = Math.pow(10, log10Efw);
      formulaUsed = 'Hadlock II (DBP + CA + CF)';
    }

    const estGa = efwGrams ? estimateGaFromWeight(efwGrams) : null;
    const hasAny = Boolean(bpd || hc || ac || fl);
    const summaryText = efwGrams
      ? `${tr('Peso Fetal Estimado', 'Estimated Fetal Weight', 'Peso Fetal Estimado')} (${formulaUsed}): ${Math.round(efwGrams)} g (${fmt(efwGrams / 1000, 2)} kg)${estGa ? ` · ~${estGa}` : ''}`
      : '';

    return (
      <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
        {renderUnitHeader(
          tr(
            'Calculadora de Peso Fetal (Hadlock)',
            'Fetal Weight Calculator (Hadlock)',
            'Calculadora de Peso Fetal (Hadlock)'
          ),
          hasAny
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {tr('DBP', 'BPD', 'DBP')} ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={bpd}
              onChange={(e) => setBpd(e.target.value)}
              placeholder={unit === 'mm' ? '80' : '8,0'}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {tr('CC', 'HC', 'CC')} ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={hc}
              onChange={(e) => setHc(e.target.value)}
              placeholder={unit === 'mm' ? '295' : '29,5'}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {tr('CA', 'AC', 'CA')} ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={ac}
              onChange={(e) => setAc(e.target.value)}
              placeholder={unit === 'mm' ? '280' : '28,0'}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {tr('CF', 'FL', 'LF')} ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={fl}
              onChange={(e) => setFl(e.target.value)}
              placeholder={unit === 'mm' ? '61' : '6,1'}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        {efwGrams ? (
          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/70 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {formulaUsed}
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {Math.round(efwGrams)} g{' '}
                  <span className="text-xs font-semibold text-teal-700 dark:text-cyan-400">
                    ({fmt(efwGrams / 1000, 2)} kg)
                  </span>
                  {estGa && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-2">
                      · {tr('IG aprox.', 'Est. GA', 'EG aprox.')} {estGa}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyText(summaryText)}
                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? tr('Copiado', 'Copied', 'Copiado') : tr('Copiar', 'Copy', 'Copiar')}</span>
              </button>
            </div>
            {renderRangeStatus(efwGrams, volMin, volMax, 'g')}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {tr(
              'Preencha os 4 parâmetros (Hadlock IV) ou pelo menos CA + CF + DBP/CC (Hadlock II/III).',
              'Enter all 4 parameters (Hadlock IV) or at least AC + FL + BPD/HC (Hadlock II/III).',
              'Complete los 4 parámetros (Hadlock IV) o al menos CA + LF + DBP/CC (Hadlock II/III).'
            )}
          </p>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. VOLUME / WEIGHT / SPLEEN / THYROID / PROSTATE / BLADDER CALCULATORS
  // =========================================================================
  const vL1 = parseNum(len1);
  const vA1 = parseNum(ap1);
  const vT1 = parseNum(tr1);
  const hasPrimary = Boolean(vL1 && vA1 && vT1);
  const vol1 = hasPrimary ? toCm(vL1!) * toCm(vA1!) * toCm(vT1!) * 0.523 : null;

  const vL2 = parseNum(len2);
  const vA2 = parseNum(ap2);
  const vT2 = parseNum(tr2);
  const hasSecondary = Boolean(vL2 && vA2 && vT2);
  const vol2 = hasSecondary ? toCm(vL2!) * toCm(vA2!) * toCm(vT2!) * 0.523 : null;

  const hasAny = Boolean(len1 || ap1 || tr1 || len2 || ap2 || tr2);

  // Determine combined metrics depending on calculatorType
  const isThyroid = calculatorType === 'thyroid';
  const isBladder = calculatorType === 'bladder';
  const isSpleen = calculatorType === 'spleen';
  const isProstate = calculatorType === 'prostate';

  const totalThyroidVol = isThyroid && vol1 !== null ? vol1 + (vol2 ?? 0) : null;
  const splenicIndex =
    isSpleen && hasPrimary ? toCm(vL1!) * toCm(vA1!) * toCm(vT1!) : null;
  const postVoidPct =
    isBladder && vol1 !== null && vol2 !== null && vol1 > 0
      ? (vol2 / vol1) * 100
      : null;

  const primaryDisplayVol = isThyroid ? totalThyroidVol : vol1;
  const weightGrams =
    primaryDisplayVol !== null && density
      ? primaryDisplayVol * density
      : null;

  const primaryAxisPlaceholder = (cmDefault: string, mmDefault: string) =>
    unit === 'mm' ? mmDefault : cmDefault;

  let copySummary = '';
  if (isThyroid && totalThyroidVol !== null) {
    copySummary = `${organTitle}: ${
      vol2 !== null
        ? `${tr('Lobo D', 'R Lobe', 'Lób. D')} ${fmt(vol1!)} mL + ${tr('Lobo E', 'L Lobe', 'Lób. I')} ${fmt(vol2)} mL = `
        : ''
    }${fmt(totalThyroidVol)} mL (~${fmt(totalThyroidVol * (density ?? 1))} g)`;
  } else if (isBladder && vol1 !== null) {
    copySummary = `${organTitle}: ${tr('Pré-miccional', 'Pre-void', 'Premiccional')} ${fmt(vol1)} mL${
      vol2 !== null
        ? ` · ${tr('Resíduo pós-miccional', 'Post-void residual', 'Residuo posmiccional')} ${fmt(vol2)} mL (${fmt(postVoidPct ?? 0, 0)}%)`
        : ''
    }`;
  } else if (vol1 !== null) {
    copySummary = `${organTitle}: ${fmt(vol1)} ${volUnit}${
      weightGrams !== null ? ` (~${fmt(weightGrams)} g)` : ''
    }${splenicIndex !== null ? ` · ${tr('Índice esplênico', 'Splenic index', 'Índice esplénico')}: ${fmt(splenicIndex, 0)}` : ''}`;
  }

  return (
    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
      {renderUnitHeader(
        isThyroid
          ? tr(
              'Calculadora de Volume & Peso Tireoidiano',
              'Thyroid Volume & Weight Calculator',
              'Calculadora de Volumen y Peso Tiroideo'
            )
          : isBladder
            ? tr(
                'Calculadora de Volume Vesical & Resíduo',
                'Bladder Volume & PVR Calculator',
                'Calculadora de Volumen Vesical y Residuo'
              )
            : isProstate
              ? tr(
                  'Calculadora de Volume & Peso Prostático',
                  'Prostate Volume & Weight Calculator',
                  'Calculadora de Volumen y Peso Prostático'
                )
              : tr(
                  'Calculadora de Volume Elipsoide & Peso',
                  'Ellipsoid Volume & Weight Calculator',
                  'Calculadora de Volumen Elipsoide y Peso'
                ),
        hasAny
      )}

      {/* Primary 3-axis row */}
      <div className="space-y-1.5">
        {(isThyroid || isBladder) && (
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
            {isThyroid
              ? tr('Lobo Direito (ou Único)', 'Right Lobe (or Single)', 'Lóbulo Derecho (o Único)')
              : tr('Bexiga Pré-Miccional', 'Pre-Void Bladder', 'Vejiga Premiccional')}
          </span>
        )}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              {tr('Comp.', 'Length', 'Long.')} ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={len1}
              onChange={(e) => setLen1(e.target.value)}
              placeholder={primaryAxisPlaceholder('4,5', '45')}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              AP ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={ap1}
              onChange={(e) => setAp1(e.target.value)}
              placeholder={primaryAxisPlaceholder('1,8', '18')}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
              {tr('Transv.', 'Width', 'Transv.')} ({unit})
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={tr1}
              onChange={(e) => setTr1(e.target.value)}
              placeholder={primaryAxisPlaceholder('1,6', '16')}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* Optional secondary 3-axis row for Thyroid Left Lobe or Bladder Post-Void */}
      {(isThyroid || isBladder) && (
        <div className="space-y-1.5 pt-1 border-t border-slate-200/80 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block">
            {isThyroid
              ? tr('Lobo Esquerdo (opcional, para somar total)', 'Left Lobe (optional, for total volume)', 'Lóbulo Izquierdo (opcional, suma total)')
              : tr('Pós-Miccional (opcional, para resíduo)', 'Post-Void (optional, for PVR)', 'Posmiccional (opcional, residuo)')}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={len2}
              onChange={(e) => setLen2(e.target.value)}
              placeholder={`${tr('Comp.', 'Length', 'Long.')} (${unit})`}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <input
              type="text"
              inputMode="decimal"
              value={ap2}
              onChange={(e) => setAp2(e.target.value)}
              placeholder={`AP (${unit})`}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <input
              type="text"
              inputMode="decimal"
              value={tr2}
              onChange={(e) => setTr2(e.target.value)}
              placeholder={`${tr('Transv.', 'Width', 'Transv.')} (${unit})`}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>
      )}

      {/* Results block */}
      {primaryDisplayVol !== null ? (
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800/70 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              {isThyroid ? (
                <>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {vol2 !== null
                      ? tr('Volume Total:', 'Total Volume:', 'Volumen Total:')
                      : tr('Volume do Lobo:', 'Lobe Volume:', 'Volumen del Lóbulo:')}{' '}
                    {fmt(primaryDisplayVol)} mL{' '}
                    {weightGrams !== null && (
                      <span className="text-xs font-semibold text-teal-700 dark:text-cyan-400">
                        (~{fmt(weightGrams)} g)
                      </span>
                    )}
                  </p>
                  {vol2 !== null && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tr('Lobo D', 'R Lobe', 'Lób. D')}: {fmt(vol1!)} mL ·{' '}
                      {tr('Lobo E', 'L Lobe', 'Lób. I')}: {fmt(vol2)} mL
                    </p>
                  )}
                </>
              ) : isBladder ? (
                <>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {tr('Volume Pré-Miccional:', 'Pre-Void Volume:', 'Volumen Premiccional:')}{' '}
                    {fmt(vol1!)} mL
                  </p>
                  {vol2 !== null && (
                    <p className="text-xs font-semibold text-teal-700 dark:text-cyan-400">
                      {tr('Resíduo Pós-Miccional:', 'Post-Void Residual:', 'Residuo Posmiccional:')}{' '}
                      {fmt(vol2)} mL ({fmt(postVoidPct ?? 0, 0)}%)
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {tr('Volume:', 'Volume:', 'Volumen:')} {fmt(primaryDisplayVol)} {volUnit}{' '}
                    {weightGrams !== null && (
                      <span className="text-xs font-semibold text-teal-700 dark:text-cyan-400">
                        · {tr('Peso est.', 'Est. weight', 'Peso est.')} ~{fmt(weightGrams)} g
                      </span>
                    )}
                  </p>
                  {splenicIndex !== null && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      {tr('Índice Esplênico:', 'Splenic Index:', 'Índice Esplénico:')}{' '}
                      <strong>{fmt(splenicIndex, 0)}</strong>{' '}
                      <span
                        className={
                          splenicIndex < 480
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }
                      >
                        ({splenicIndex < 480 ? tr('normal < 480', 'normal < 480', 'normal < 480') : tr('aumentado ≥ 480', 'elevated ≥ 480', 'aumentado ≥ 480')})
                      </span>
                    </p>
                  )}
                  {isProstate && primaryDisplayVol > 30 && (
                    <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      {primaryDisplayVol <= 50
                        ? tr('Sugestivo de aumento leve (HPB leve: 30–50 cm³)', 'Mild enlargement (30–50 cm³)', 'Aumento leve (HPB leve: 30–50 cm³)')
                        : primaryDisplayVol <= 80
                          ? tr('Sugestivo de aumento moderado (50–80 cm³)', 'Moderate enlargement (50–80 cm³)', 'Aumento moderado (50–80 cm³)')
                          : tr('Sugestivo de aumento acentuado (> 80 cm³)', 'Marked enlargement (> 80 cm³)', 'Aumento marcado (> 80 cm³)')}
                    </p>
                  )}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleCopyText(copySummary)}
              className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? tr('Copiado', 'Copied', 'Copiado') : tr('Copiar', 'Copy', 'Copiar')}</span>
            </button>
          </div>

          {isBladder && vol2 !== null
            ? renderRangeStatus(vol2, 0, 50, 'mL')
            : renderRangeStatus(primaryDisplayVol, volMin, volMax, volUnit)}
        </div>
      ) : (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {tr(
            `Informe os 3 eixos em ${unit} para calcular volume (${volUnit})${density ? ' e peso estimado (g)' : ''}.`,
            `Enter all 3 axes in ${unit} to calculate volume (${volUnit})${density ? ' & estimated weight (g)' : ''}.`,
            `Ingrese los 3 ejes en ${unit} para calcular volumen (${volUnit})${density ? ' y peso estimado (g)' : ''}.`
          )}
        </p>
      )}
    </div>
  );
};
