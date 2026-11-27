import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ExamMeasurement } from '../../types/ultrasound';
import {
  ZoomIn,
  ZoomOut,
  Sun,
  Contrast,
  RotateCcw,
  Ruler,
  Eye,
  Plus,
  X,
  Pin,
} from 'lucide-react';

interface UltrasoundViewerProps {
  imageUrl: string;
  examTitle?: string;
  measurements?: ExamMeasurement[];
  onMeasurementsChange?: (measurements: ExamMeasurement[]) => void;
  onActiveCaliperChange?: (caliperValue: string | null) => void;
}

export const UltrasoundViewer: React.FC<UltrasoundViewerProps> = ({
  imageUrl,
  examTitle,
  measurements = [],
  onMeasurementsChange,
  onActiveCaliperChange,
}) => {
  const { t } = useLanguage();
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [isCaliperActive, setIsCaliperActive] = useState<boolean>(false);

  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null);
  const [manualLabel, setManualLabel] = useState<string>('');
  const [manualValue, setManualValue] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setZoom(100);
    setCaliperStart(null);
    setCaliperEnd(null);
    setIsCaliperActive(false);
  };

  useEffect(() => {
    setCaliperStart(null);
    setCaliperEnd(null);
  }, [imageUrl]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCaliperActive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!caliperStart || (caliperStart && caliperEnd)) {
      setCaliperStart({ x, y });
      setCaliperEnd(null);
    } else {
      setCaliperEnd({ x, y });
    }
  };

  const calculatedDistanceMm = (() => {
    if (!caliperStart || !caliperEnd) return null;
    const dx = caliperEnd.x - caliperStart.x;
    const dy = caliperEnd.y - caliperStart.y;
    const pixelDist = Math.sqrt(dx * dx + dy * dy);
    return (pixelDist / 8).toFixed(1);
  })();

  useEffect(() => {
    onActiveCaliperChange?.(
      calculatedDistanceMm ? `${calculatedDistanceMm} mm` : null
    );
  }, [calculatedDistanceMm, onActiveCaliperChange]);

  const handlePinActiveCaliper = () => {
    if (!calculatedDistanceMm || !onMeasurementsChange) return;
    const nextItem: ExamMeasurement = {
      id: `meas-${Date.now()}`,
      label: manualLabel.trim() || undefined,
      value: `${calculatedDistanceMm} mm`,
      source: 'caliper',
    };
    onMeasurementsChange([...measurements, nextItem]);
    setManualLabel('');
    setCaliperStart(null);
    setCaliperEnd(null);
  };

  const handleAddManualMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedLabel = manualLabel.trim();
    const trimmedVal = manualValue.trim();
    if ((!trimmedLabel && !trimmedVal) || !onMeasurementsChange) return;
    const nextItem: ExamMeasurement = {
      id: `meas-${Date.now()}`,
      label: trimmedLabel || undefined,
      value: trimmedVal,
      source: 'manual',
    };
    onMeasurementsChange([...measurements, nextItem]);
    setManualLabel('');
    setManualValue('');
  };

  const handleRemoveMeasurement = (id: string) => {
    if (!onMeasurementsChange) return;
    onMeasurementsChange(measurements.filter((m) => m.id !== id));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200">
            {examTitle || t.viewer.defaultTitle}
          </span>
          <span className="text-slate-500 hidden sm:inline">· {t.viewer.subtitle}</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsInverted((prev) => !prev)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              isInverted
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t.viewer.invert}
          </button>

          <button
            type="button"
            onClick={() => setIsCaliperActive((prev) => !prev)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              isCaliperActive
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Ruler className="w-3 h-3" />
            <span>{t.viewer.caliper}</span>
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(prev + 25, 250))}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            aria-label="Zoom +"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(prev - 25, 100))}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            aria-label="Zoom -"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            aria-label="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Canvas View */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`relative w-full aspect-4/3 sm:aspect-16/10 bg-black flex items-center justify-center overflow-hidden ${
          isCaliperActive ? 'cursor-crosshair touch-none' : 'cursor-default'
        }`}
      >
        <img
          src={imageUrl}
          alt={t.viewer.defaultTitle}
          style={{
            filter: `brightness(${brightness}%) contrast(${contrast}%) ${
              isInverted ? 'invert(1)' : ''
            }`,
            transform: `scale(${zoom / 100})`,
            transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
          }}
          className="max-w-full max-h-full object-contain pointer-events-none select-none"
        />

        {caliperStart && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <circle
              cx={caliperStart.x}
              cy={caliperStart.y}
              r={4}
              fill="#f59e0b"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            {caliperEnd && (
              <>
                <line
                  x1={caliperStart.x}
                  y1={caliperStart.y}
                  x2={caliperEnd.x}
                  y2={caliperEnd.y}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                />
                <circle
                  cx={caliperEnd.x}
                  cy={caliperEnd.y}
                  r={4}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
                <rect
                  x={(caliperStart.x + caliperEnd.x) / 2 - 28}
                  y={(caliperStart.y + caliperEnd.y) / 2 - 20}
                  width={56}
                  height={18}
                  rx={4}
                  fill="#0f172a"
                  stroke="#f59e0b"
                  strokeWidth={1}
                />
                <text
                  x={(caliperStart.x + caliperEnd.x) / 2}
                  y={(caliperStart.y + caliperEnd.y) / 2 - 7}
                  fill="#f59e0b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {calculatedDistanceMm} mm
                </text>
              </>
            )}
          </svg>
        )}

        {isCaliperActive && (
          <div className="absolute top-3 left-3 bg-slate-950/85 border border-amber-500/40 px-2.5 py-1 rounded text-xs text-amber-300 flex items-center gap-1.5 shadow-md backdrop-blur-sm pointer-events-none">
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {!caliperStart
                ? t.viewer.caliperStart
                : !caliperEnd
                ? t.viewer.caliperEnd
                : `${t.viewer.caliperResult}: ${calculatedDistanceMm} mm`}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Range Sliders */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Sun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 text-[11px] w-14 shrink-0 truncate">
            {t.viewer.brightness}
          </span>
          <input
            type="range"
            min="40"
            max="180"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-slate-400 font-mono text-[10px] w-8 text-right tabular-nums">
            {brightness}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Contrast className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-400 text-[11px] w-14 shrink-0 truncate">
            {t.viewer.contrast}
          </span>
          <input
            type="range"
            min="50"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-slate-400 font-mono text-[10px] w-8 text-right tabular-nums">
            {contrast}%
          </span>
        </div>
      </div>

      {/* Measurements Panel synced directly to Report Generation */}
      {onMeasurementsChange && (
        <div className="px-3.5 py-3 bg-slate-950 border-t border-slate-800 space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" />
              <span>{t.viewer.measurementsTitle}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              {t.viewer.caliperAutoHint}
            </span>
          </div>

          {(calculatedDistanceMm || measurements.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {calculatedDistanceMm && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-[11px] font-medium">
                  <Ruler className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    Caliper: <strong className="font-mono">{calculatedDistanceMm} mm</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handlePinActiveCaliper}
                    className="ml-1 px-1.5 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/35 text-amber-200 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                    title={t.viewer.pinCaliper}
                  >
                    <Pin className="w-2.5 h-2.5" />
                    <span>{t.viewer.pinCaliper}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCaliperStart(null);
                      setCaliperEnd(null);
                    }}
                    className="text-amber-300/70 hover:text-amber-100 ml-0.5"
                    aria-label="Clear caliper"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {measurements.map((m) => (
                <div
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-900/50 border border-teal-700/60 text-cyan-100 text-[11px] font-medium"
                >
                  <span>
                    {m.label && m.value ? (
                      <>
                        {m.label}: <strong className="font-mono">{m.value}</strong>
                      </>
                    ) : m.label ? (
                      <strong>{m.label}</strong>
                    ) : (
                      <strong className="font-mono">{m.value}</strong>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeasurement(m.id)}
                    className="text-cyan-300/70 hover:text-white"
                    aria-label="Remove measurement"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400">
              {t.viewer.manualMeasureHint}
            </p>
            <form onSubmit={handleAddManualMeasurement} className="grid grid-cols-12 gap-1.5">
              <input
                type="text"
                value={manualLabel}
                onChange={(e) => setManualLabel(e.target.value)}
                placeholder={t.viewer.labelPlaceholder}
                className="col-span-5 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <input
                type="text"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder={t.viewer.valuePlaceholder}
                className="col-span-4 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={!manualLabel.trim() && !manualValue.trim()}
                className="col-span-3 px-2 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 disabled:opacity-40 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t.viewer.addMeasureBtn}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

