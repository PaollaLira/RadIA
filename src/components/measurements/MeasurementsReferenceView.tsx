import React, { useState } from 'react';
import {
  Ruler,
  Search,
  Baby,
  User,
  HeartPulse,
  Copy,
  Check,
  Calculator,
  Table2,
  X,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  SearchX,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  ReferenceGroup,
  FetalTrimester,
  PediatricAgeBandId,
  PEDIATRIC_AGE_BANDS,
  FETAL_MEASUREMENTS,
  PEDIATRIC_ORGAN_TABLES,
  ADULT_MEASUREMENTS,
  ReferenceMeasurement,
} from '../../data/usgReferenceMeasurements';

export const MeasurementsReferenceView: React.FC = () => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  const [selectedGroup, setSelectedGroup] = useState<ReferenceGroup>('fetal');
  const [selectedTrimester, setSelectedTrimester] = useState<FetalTrimester | 'all'>('first');
  const [selectedAgeBand, setSelectedAgeBand] = useState<PediatricAgeBandId>('child4to6y');
  const [selectedPedOrgan, setSelectedPedOrgan] = useState<string>('all');
  const [selectedAdultCat, setSelectedAdultCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [activeCheckerId, setActiveCheckerId] = useState<string | null>(null);
  const [testValue, setTestValue] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, title: string, range: string, unit: string) => {
    const text = `${title}: ${range}${unit ? ` ${unit}` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1800);
    } catch {
      // ignore clipboard restrictions
    }
  };

  const renderQuickChecker = (minVal?: number, maxVal?: number, unit?: string) => {
    const parsed = parseFloat(testValue.trim().replace(',', '.'));
    const valid = !Number.isNaN(parsed) && (minVal !== undefined || maxVal !== undefined);

    let status: 'low' | 'high' | 'normal' | null = null;
    if (valid) {
      if (minVal !== undefined && parsed < minVal) status = 'low';
      else if (maxVal !== undefined && parsed > maxVal) status = 'high';
      else status = 'normal';
    }

    return (
      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder={isEn ? `Enter measured value (${unit || ''})` : `Digite o valor medido (${unit || ''})`}
            className="flex-1 text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          {testValue && (
            <button
              type="button"
              onClick={() => setTestValue('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label={isEn ? 'Clear value' : 'Limpar valor'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {status === 'low' && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>
              {isEn
                ? `Below reference (< ${minVal} ${unit || ''})`
                : `Abaixo da referência (< ${minVal} ${unit || ''})`}
            </span>
          </div>
        )}
        {status === 'high' && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>
              {isEn
                ? `Above reference (> ${maxVal} ${unit || ''})`
                : `Acima da referência (> ${maxVal} ${unit || ''})`}
            </span>
          </div>
        )}
        {status === 'normal' && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isEn
                ? `Within normal range (${minVal}–${maxVal} ${unit || ''})`
                : `Dentro da faixa normal (${minVal}–${maxVal} ${unit || ''})`}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderMeasurementCard = (item: ReferenceMeasurement) => {
    const isCheckerOpen = activeCheckerId === item.id;
    const hasNumericRange = item.minVal !== undefined || item.maxVal !== undefined;
    const title = item.structure[lang];
    const range = item.normalRange[lang];
    const category = item.category[lang];
    const note = item.clinicalNote[lang];

    return (
      <div
        key={item.id}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-teal-700 dark:text-cyan-400 block">
              {category}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(item.id, title, range, item.unit)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0 transition-colors"
            title={isEn ? 'Copy reference' : 'Copiar referência'}
          >
            {copiedId === item.id ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isEn ? 'Copied' : 'Copiado'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isEn ? 'Copy' : 'Copiar'}</span>
              </>
            )}
          </button>
        </div>

        <div className="px-3 py-2 rounded-lg bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-teal-700 dark:text-cyan-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
            {range} {item.unit}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {note}
        </p>

        {hasNumericRange && (
          <div>
            <button
              type="button"
              onClick={() => {
                if (isCheckerOpen) {
                  setActiveCheckerId(null);
                } else {
                  setActiveCheckerId(item.id);
                  setTestValue('');
                }
              }}
              className="text-xs font-semibold text-teal-700 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>
                {isCheckerOpen
                  ? isEn
                    ? 'Hide comparator'
                    : 'Ocultar comparador'
                  : isEn
                    ? 'Compare measured value'
                    : 'Comparar valor medido'}
              </span>
            </button>

            {isCheckerOpen && renderQuickChecker(item.minVal, item.maxVal, item.unit)}
          </div>
        )}
      </div>
    );
  };

  const query = searchQuery.trim().toLowerCase();

  const filteredFetal = FETAL_MEASUREMENTS.filter((m) => {
    const matchesTrimester =
      selectedTrimester === 'all' || m.trimester === selectedTrimester;
    const matchesQuery =
      !query ||
      m.structure[lang].toLowerCase().includes(query) ||
      m.normalRange[lang].toLowerCase().includes(query) ||
      m.clinicalNote[lang].toLowerCase().includes(query) ||
      m.category[lang].toLowerCase().includes(query);
    return matchesTrimester && matchesQuery;
  });

  const filteredPediatricTables = PEDIATRIC_ORGAN_TABLES.filter((table) => {
    const matchesOrgan =
      selectedPedOrgan === 'all' || table.id === selectedPedOrgan;
    const matchesQuery =
      !query ||
      table.organ[lang].toLowerCase().includes(query) ||
      table.parameter[lang].toLowerCase().includes(query) ||
      table.generalNote[lang].toLowerCase().includes(query) ||
      table.rows.some((r) => r.normalRange[lang].toLowerCase().includes(query));
    return matchesOrgan && matchesQuery;
  });

  const adultCategories = Array.from(
    new Set(ADULT_MEASUREMENTS.map((m) => m.category[lang]))
  );

  const filteredAdult = ADULT_MEASUREMENTS.filter((m) => {
    const matchesCat =
      selectedAdultCat === 'all' || m.category[lang] === selectedAdultCat;
    const matchesQuery =
      !query ||
      m.category[lang].toLowerCase().includes(query) ||
      m.structure[lang].toLowerCase().includes(query) ||
      m.normalRange[lang].toLowerCase().includes(query) ||
      m.clinicalNote[lang].toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const activeAgeBandObj = PEDIATRIC_AGE_BANDS.find((b) => b.id === selectedAgeBand);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-cyan-300 flex items-center justify-center shrink-0">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEn
                ? 'Ultrasound Reference Measurements'
                : 'Consulta Rápida de Medidas Ultrassonográficas'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEn
                ? 'Look up normal biometric values by gestational trimester, pediatric age, or adult organ without creating a report.'
                : 'Consulte valores de referência por trimestre fetal, faixa etária pediátrica ou órgão adulto sem precisar emitir laudo.'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Group Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEn
                ? 'Search organ or measurement (e.g. kidney, CBD, CRL, NT, spleen)...'
                : 'Buscar órgão ou medida (ex.: rim, colédoco, CCN, TN, baço, aorta)...'
            }
            className="w-full text-xs sm:text-sm pl-9 pr-9 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label={isEn ? 'Clear search' : 'Limpar busca'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 3-Group Tabs: Fetal | Pediatria | Adulto */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setSelectedGroup('fetal');
              setActiveCheckerId(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              selectedGroup === 'fetal'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>{isEn ? 'Fetal' : 'Fetal'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedGroup('pediatric');
              setActiveCheckerId(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              selectedGroup === 'pediatric'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>{isEn ? 'Pediatric' : 'Pediatria'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedGroup('adult');
              setActiveCheckerId(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              selectedGroup === 'adult'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{isEn ? 'Adult' : 'Adulto'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: FETAL */}
      {selectedGroup === 'fetal' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'first', pt: '1º Trimestre', en: '1st Trimester' },
                { id: 'second', pt: '2º Trimestre', en: '2nd Trimester' },
                { id: 'third', pt: '3º Trimestre', en: '3rd Trimester' },
                { id: 'all', pt: 'Todos os Trimestres', en: 'All Trimesters' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTrimester(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  selectedTrimester === tab.id
                    ? 'bg-teal-800 dark:bg-teal-700 text-white border-teal-800 dark:border-teal-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isEn ? tab.en : tab.pt}
              </button>
            ))}
          </div>

          {filteredFetal.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <SearchX className="w-7 h-7 mx-auto text-slate-400" />
              <p>{isEn ? 'No measurements matched this filter.' : 'Nenhuma medida encontrada para este filtro.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFetal.map(renderMeasurementCard)}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PEDIATRIA */}
      {selectedGroup === 'pediatric' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {isEn ? 'Pediatric Age Band' : 'Faixa Etária Pediátrica'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PEDIATRIC_AGE_BANDS.map((band) => (
                  <button
                    key={band.id}
                    type="button"
                    onClick={() => setSelectedAgeBand(band.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedAgeBand === band.id
                        ? 'bg-teal-800 dark:bg-teal-700 text-white border-teal-800 dark:border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {band.label[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {isEn ? 'Organ / System' : 'Órgão / Sistema'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedPedOrgan('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    selectedPedOrgan === 'all'
                      ? 'bg-cyan-700 text-white border-cyan-700'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {isEn ? 'All Organs' : 'Todos os Órgãos'}
                </button>
                {PEDIATRIC_ORGAN_TABLES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedPedOrgan(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedPedOrgan === t.id
                        ? 'bg-cyan-700 text-white border-cyan-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.organ[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredPediatricTables.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <SearchX className="w-7 h-7 mx-auto text-slate-400" />
              <p>{isEn ? 'No measurements matched this filter.' : 'Nenhuma medida encontrada para este filtro.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPediatricTables.map((table) => {
                const currentRow =
                  table.rows.find((r) => r.ageBand === selectedAgeBand) || table.rows[0];
                const isTableExpanded = expandedTableId === table.id;
                const checkerKey = `${table.id}-${selectedAgeBand}`;
                const isCheckerOpen = activeCheckerId === checkerKey;
                const hasNumericRange =
                  currentRow.minVal !== undefined || currentRow.maxVal !== undefined;

                return (
                  <div
                    key={table.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-teal-700 dark:text-cyan-400 block">
                          {activeAgeBandObj?.label[lang]} · {table.parameter[lang]}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                          {table.organ[lang]}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            checkerKey,
                            `${table.organ[lang]} (${activeAgeBandObj?.label[lang]})`,
                            currentRow.normalRange[lang],
                            table.unit
                          )
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 shrink-0 transition-colors"
                      >
                        {copiedId === checkerKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{isEn ? 'Copied' : 'Copiado'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Copy' : 'Copiar'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="px-3 py-2.5 rounded-lg bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-teal-700 dark:text-cyan-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {currentRow.normalRange[lang]} {table.unit}
                      </span>
                    </div>

                    {currentRow.note && (
                      <p className="text-xs font-medium text-teal-700 dark:text-cyan-300">
                        {currentRow.note[lang]}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {table.generalNote[lang]}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTableId(isTableExpanded ? null : table.id)
                        }
                        className="text-xs font-semibold text-teal-700 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
                      >
                        <Table2 className="w-3.5 h-3.5" />
                        <span>
                          {isTableExpanded
                            ? isEn
                              ? 'Hide full age table'
                              : 'Ocultar tabela completa por idade'
                            : isEn
                              ? 'View full table by age'
                              : 'Ver tabela completa por idade'}
                        </span>
                      </button>

                      {hasNumericRange && (
                        <button
                          type="button"
                          onClick={() => {
                            if (isCheckerOpen) {
                              setActiveCheckerId(null);
                            } else {
                              setActiveCheckerId(checkerKey);
                              setTestValue('');
                            }
                          }}
                          className="text-xs font-semibold text-teal-700 dark:text-cyan-400 hover:underline flex items-center gap-1.5"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>
                            {isCheckerOpen
                              ? isEn
                                ? 'Hide comparator'
                                : 'Ocultar comparador'
                              : isEn
                                ? 'Compare measured value'
                                : 'Comparar valor medido'}
                          </span>
                        </button>
                      )}
                    </div>

                    {isCheckerOpen &&
                      renderQuickChecker(currentRow.minVal, currentRow.maxVal, table.unit)}

                    {isTableExpanded && (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 mt-2">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-cyan-300">
                            <tr>
                              <th className="px-3 py-2 font-bold">
                                {isEn ? 'Age Band' : 'Faixa Etária'}
                              </th>
                              <th className="px-3 py-2 font-bold">
                                {isEn ? `Reference (${table.unit})` : `Referência (${table.unit})`}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {table.rows.map((row) => {
                              const bandInfo = PEDIATRIC_AGE_BANDS.find(
                                (b) => b.id === row.ageBand
                              );
                              const isCurrent = row.ageBand === selectedAgeBand;
                              return (
                                <tr
                                  key={row.ageBand}
                                  className={
                                    isCurrent
                                      ? 'bg-teal-50/90 dark:bg-teal-950/60 font-semibold'
                                      : 'bg-white dark:bg-slate-900'
                                  }
                                >
                                  <td className="px-3 py-2 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                    {bandInfo?.label[lang]}
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300">
                                    {row.normalRange[lang]}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: ADULTO */}
      {selectedGroup === 'adult' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedAdultCat('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                selectedAdultCat === 'all'
                  ? 'bg-teal-800 dark:bg-teal-700 text-white border-teal-800 dark:border-teal-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {isEn ? 'All Organs' : 'Todos os Órgãos'}
            </button>
            {adultCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedAdultCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  selectedAdultCat === cat
                    ? 'bg-teal-800 dark:bg-teal-700 text-white border-teal-800 dark:border-teal-600'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredAdult.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <SearchX className="w-7 h-7 mx-auto text-slate-400" />
              <p>{isEn ? 'No measurements matched this filter.' : 'Nenhuma medida encontrada para este filtro.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAdult.map(renderMeasurementCard)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
