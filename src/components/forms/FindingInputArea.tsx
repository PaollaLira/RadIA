import React from 'react';
import { UltrasoundSpecialty, TransducerType } from '../../types/ultrasound';
import { useLanguage } from '../../i18n/LanguageContext';
import { AppLanguage } from '../../i18n/translations';
import { Camera, FileText, Sparkles, CheckCircle, Wand2, User, MessageSquare } from 'lucide-react';

interface FindingInputAreaProps {
  inputMode: 'CAMERA_IMAGE' | 'TEXT_FINDING';
  onChangeInputMode: (mode: 'CAMERA_IMAGE' | 'TEXT_FINDING') => void;
  patientName: string;
  onChangePatientName: (name: string) => void;
  patientAge: string;
  onChangePatientAge: (age: string) => void;
  patientGender: 'M' | 'F' | 'Outro';
  onChangePatientGender: (gender: 'M' | 'F' | 'Outro') => void;
  specialty: UltrasoundSpecialty | '';
  onChangeSpecialty: (specialty: UltrasoundSpecialty | '') => void;
  transducer: TransducerType | '';
  onChangeTransducer: (transducer: TransducerType | '') => void;
  textFinding: string;
  onChangeTextFinding: (text: string) => void;
  hasCapturedImage: boolean;
  onOpenLiveCamera: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onOpenChat?: () => void;
}

const DEFAULT_TRANSDUCER_BY_SPECIALTY: Record<UltrasoundSpecialty, TransducerType> = {
  ABDOMEN: 'CONVEX',
  THYROID: 'LINEAR',
  POCUS_FAST: 'SECTOR',
  URINARY_KIDNEYS: 'CONVEX',
  BREAST: 'LINEAR',
  PELVIC_GYN: 'ENDOCAVITARY',
  VASCULAR_DOPPLER: 'LINEAR',
};

const QUICK_PHRASES: Record<AppLanguage, Record<UltrasoundSpecialty, string[]>> = {
  pt: {
    ABDOMEN: [
      'Vesícula biliar distendida com cálculo de 19 mm impactado no colo, espessamento parietal de 5.4 mm com halo hipoecogênico, líquido perivesicular laminar e sinal de Murphy ultrassonográfico positivo.',
      'Fígado com aumento difuso da ecogenicidade e atenuação acústica posterior profunda, compatível com esteatose hepática moderada a grave. Sem lesões nodulares suspeitas.',
      'Aorta abdominal em segmento infrarrenal com calibre normal e paredes regulares, diâmetro anteroposterior máximo de 18 mm. Sem aneurisma.',
    ],
    THYROID: [
      'Nódulo sólido marcadamente hipoecoico em terço médio do lobo direito medindo 15 x 11 x 13 mm. Relação mais alto que largo, margens microlobuladas e microcalcificações centrais puntiformes. ACR TI-RADS 5.',
      'Nódulo isoecoico espongiforme em lobo esquerdo medindo 12 mm, com halo fino hipoecoico regular completo e ausência de calcificações. ACR TI-RADS 2.',
      'Tireoide difusamente heterogênea e hipoecogênica com traves ecogênicas e micronodulações, compatível com tireoidite crônica autoimune (Hashimoto).',
    ],
    POCUS_FAST: [
      'E-FAST Trauma: Presença de lâmina líquida anecoica franca em recesso hepatorrenal de Morrison (espessura 16 mm) e lâmina em recesso esplenorrenal. Janela pericárdica livre e deslizamento pleural preservado bilateralmente.',
      'FAST Negativo em 4 quadrantes abdominais. Ausência de líquido livre intraperitoneal em Morrison, esplenorrenal e escavação pélvica.',
      'POCUS Torácico: Ausência de deslizamento pleural ("lung sliding") no ápice pulmonar direito, com identificação de ponto pulmonar ("lung point") compatível com pneumotórax traumático.',
    ],
    URINARY_KIDNEYS: [
      'Moderada a importante ectasia pielocalicinal no rim esquerdo (pelve 23 mm). Imagem hiperecogênica com 8 mm no terço distal do ureter esquerdo / junção ureterovesical, produzindo sombra acústica e artefato de cintilação.',
      'Cisto cortical simples no polo superior do rim direito medindo 32 mm, com paredes finas e conteúdo puramente anecoico (Bosniak I). Rins de dimensões normais.',
      'Rins tópicos com diferenciação cortiçomedular preservada. Sem cálculos obstrutivos, massas parenquimatosas ou ectasia urinária detectável.',
    ],
    BREAST: [
      'Nódulo anecoico oval, circunscrito, de paredes finas e reforço acústico posterior límpido no QSE da mama esquerda às 2h, medindo 8 x 5 mm. Sem vascularização ao Doppler (BI-RADS 2).',
      'Nódulo hipoecoico de orientação não paralela à pele no QSL da mama direita medindo 14 x 11 mm, com margens espiculadas e sombra acústica posterior (BI-RADS 5).',
      'Nódulo oval circunscrito de ecotextura homogênea discretamente hipoecoico paralelo à pele em mama direita, medindo 11 x 6 mm, estável há mais de 2 anos (BI-RADS 3).',
    ],
    PELVIC_GYN: [
      'Útero em anteversoflexão de contornos regulares e miométrio homogêneo. Endométrio centrado e linear medindo 4 mm em fase pós-menopausa.',
      'Formação cística anexial direita com conteúdo espesso finamente particulado em "vidro fosco" medindo 42 mm, sugestiva de endometrioma ovariano.',
    ],
    VASCULAR_DOPPLER: [
      'Veia femoral comum e veia poplítea esquerdas incompressíveis à manobra do transdutor, com conteúdo ecogênico intraluminal e ausência de fluxo ao Doppler colorido e espectral (Trombose Venosa Profunda Aguda).',
      'Bulbos e bifurcações carotídeas sem placas ateromatosas estenosantes significativas. Velocidades de pico sistólico normais bilateralmente.',
    ],
  },
  en: {
    ABDOMEN: [
      'Distended gallbladder with a 19 mm calculus impacted at the neck, 5.4 mm wall thickening with hypoechoic mural halo, pericholecystic fluid, and positive sonographic Murphy sign.',
      'Liver with diffusely increased echogenicity and deep posterior acoustic attenuation, consistent with moderate-to-severe hepatic steatosis. No suspicious focal lesions.',
      'Infrarenal abdominal aorta with normal caliber and smooth walls, maximum AP diameter of 18 mm. No aneurysm.',
    ],
    THYROID: [
      'Markedly hypoechoic solid nodule in the mid right thyroid lobe measuring 15 x 11 x 13 mm. Taller-than-wide shape, microlobulated margins, and punctate echogenic foci. ACR TI-RADS 5.',
      'Spongiform isoechoic nodule in the left lobe measuring 12 mm, with a thin regular halo and no calcifications. ACR TI-RADS 2.',
      'Diffusely heterogeneous hypoechoic thyroid parenchyma with echogenic fibrous septations and micronodularity, consistent with chronic autoimmune thyroiditis (Hashimoto).',
    ],
    POCUS_FAST: [
      'E-FAST Trauma: Frank anechoic free fluid stripe in the hepatorenal recess / Morison pouch (16 mm depth) and splenorenal recess. Clear pericardial window and preserved bilateral lung sliding.',
      'Negative 4-quadrant abdominal FAST. No intraperitoneal free fluid in Morison pouch, splenorenal recess, or pelvic cul-de-sac.',
      'Thoracic POCUS: Absent pleural lung sliding at the right pulmonary apex with an identifiable lung point, consistent with traumatic pneumothorax.',
    ],
    URINARY_KIDNEYS: [
      'Moderate-to-severe left pelvicalyceal ectasia (renal pelvis 23 mm). Hyperechoic 8 mm calculus at the distal left ureter / UVJ producing posterior acoustic shadowing and twinkling artifact.',
      'Simple cortical cyst in the upper pole of the right kidney measuring 32 mm, thin walls, purely anechoic content (Bosniak I). Normal renal dimensions.',
      'Normally positioned kidneys with preserved corticomedullary differentiation. No obstructing calculi, parenchymal masses, or hydronephrosis.',
    ],
    BREAST: [
      'Oval, circumscribed anechoic cyst with thin walls and crisp posterior acoustic enhancement in the left breast UOQ at 2 o’clock, measuring 8 x 5 mm. No internal Doppler flow (BI-RADS 2).',
      'Anti-parallel hypoechoic solid mass in the right breast UOQ measuring 14 x 11 mm, with spiculated margins and posterior acoustic shadowing (BI-RADS 5).',
      'Oval, circumscribed, homogeneously mildly hypoechoic nodule parallel to skin in the right breast measuring 11 x 6 mm, stable for over 2 years (BI-RADS 3).',
    ],
    PELVIC_GYN: [
      'Anteverted uterus with smooth contours and homogeneous myometrium. Centered linear endometrium measuring 4 mm in postmenopausal status.',
      'Right adnexal cystic lesion with homogeneous low-level internal echoes ("ground-glass" appearance) measuring 42 mm, suggestive of ovarian endometrioma.',
    ],
    VASCULAR_DOPPLER: [
      'Non-compressible left common femoral and popliteal veins with intraluminal echogenic thrombus and absent color/spectral Doppler flow (Acute Deep Vein Thrombosis).',
      'Bilateral carotid bulbs and bifurcations without hemodynamically significant stenotic plaque. Normal peak systolic velocities bilaterally.',
    ],
  },
};

export const FindingInputArea: React.FC<FindingInputAreaProps> = ({
  inputMode,
  onChangeInputMode,
  patientName,
  onChangePatientName,
  patientAge,
  onChangePatientAge,
  patientGender,
  onChangePatientGender,
  specialty,
  onChangeSpecialty,
  transducer,
  onChangeTransducer,
  textFinding,
  onChangeTextFinding,
  hasCapturedImage,
  onOpenLiveCamera,
  onAnalyze,
  isAnalyzing,
  onOpenChat,
}) => {
  const { lang, t } = useLanguage();

  const specialtyOrder: UltrasoundSpecialty[] = [
    'ABDOMEN',
    'THYROID',
    'POCUS_FAST',
    'URINARY_KIDNEYS',
    'BREAST',
    'PELVIC_GYN',
    'VASCULAR_DOPPLER',
  ];

  const handleApplyPresetPhrase = (phrase: string) => {
    onChangeTextFinding(phrase);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 text-slate-800 dark:text-slate-200">
      {/* Selector: Camera vs Confirmed Finding */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-800 dark:text-cyan-400 block">
            {t.findingInput.header}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {t.findingInput.subheader}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => onChangeInputMode('CAMERA_IMAGE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              inputMode === 'CAMERA_IMAGE'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-200 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.findingInput.modeCamera}</span>
            <span className="sm:hidden">{t.findingInput.modeCameraShort}</span>
          </button>
          <button
            onClick={() => onChangeInputMode('TEXT_FINDING')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              inputMode === 'TEXT_FINDING'
                ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-200 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.findingInput.modeText}</span>
            <span className="sm:hidden">{t.findingInput.modeTextShort}</span>
          </button>
        </div>
      </div>

      {/* Patient Name, Age & Sex Inputs for Report */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3.5">
        <div className="sm:col-span-7">
          <label
            htmlFor="finding-patient-name"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            {t.findingInput.patientNameLabel}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="finding-patient-name"
              type="text"
              value={patientName}
              onChange={(e) => onChangePatientName(e.target.value)}
              placeholder={t.findingInput.patientNamePlaceholder}
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="finding-patient-age"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            {t.findingInput.ageLabel}
          </label>
          <input
            id="finding-patient-age"
            type="number"
            min="0"
            max="120"
            value={patientAge}
            onChange={(e) => onChangePatientAge(e.target.value)}
            placeholder={t.findingInput.agePlaceholder}
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        <div className="sm:col-span-3">
          <label
            htmlFor="finding-patient-gender"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            {t.findingInput.genderLabel}
          </label>
          <select
            id="finding-patient-gender"
            value={patientGender}
            onChange={(e) => onChangePatientGender(e.target.value as 'M' | 'F' | 'Outro')}
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="F">{t.patientCard.female}</option>
            <option value="M">{t.patientCard.male}</option>
            <option value="Outro">{t.patientCard.other}</option>
          </select>
        </div>
      </div>

      {/* Specialty and Transducer Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.findingInput.specialtyLabel}
          </label>
          <select
            value={specialty}
            onChange={(e) => {
              const newSpec = e.target.value as UltrasoundSpecialty | '';
              onChangeSpecialty(newSpec);
              onChangeTransducer(newSpec ? DEFAULT_TRANSDUCER_BY_SPECIALTY[newSpec] : '');
            }}
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="">{t.findingInput.specialtyPlaceholder}</option>
            {specialtyOrder.map((key) => (
              <option key={key} value={key}>
                {t.specialties[key]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.findingInput.transducerLabel}
          </label>
          <select
            value={transducer}
            onChange={(e) => onChangeTransducer(e.target.value as TransducerType | '')}
            className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="">{t.findingInput.transducerPlaceholder}</option>
            <option value="CONVEX">{t.transducers.CONVEX}</option>
            <option value="LINEAR">{t.transducers.LINEAR}</option>
            <option value="SECTOR">{t.transducers.SECTOR}</option>
            <option value="ENDOCAVITARY">{t.transducers.ENDOCAVITARY}</option>
          </select>
        </div>
      </div>

      {/* Mode A: Camera Capture Trigger */}
      {inputMode === 'CAMERA_IMAGE' && (
        <div className="mb-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center text-teal-800 dark:text-cyan-300">
            {hasCapturedImage ? <CheckCircle className="w-6 h-6 text-teal-600" /> : <Camera className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              {hasCapturedImage ? t.findingInput.photoLoaded : t.findingInput.photoCaptureTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
              {hasCapturedImage ? t.findingInput.photoLoadedDesc : t.findingInput.photoCaptureDesc}
            </p>
          </div>
          <button
            onClick={onOpenLiveCamera}
            className="px-4 py-2.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Camera className="w-4 h-4" />
            <span>{hasCapturedImage ? t.findingInput.retakePhoto : t.findingInput.openMobileCamera}</span>
          </button>
        </div>
      )}

      {/* Quick Clinical Shortcuts */}
      {specialty && QUICK_PHRASES[lang][specialty] && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Wand2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{t.findingInput.quickShortcuts}</span>
          </div>
          <div className="space-y-1.5">
            {QUICK_PHRASES[lang][specialty].map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPresetPhrase(phrase)}
                className="w-full text-left p-2 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-slate-700 dark:text-slate-300 line-clamp-2"
              >
                <span className="font-semibold text-teal-700 dark:text-cyan-400 mr-1.5">
                  {t.findingInput.optionPrefix} {idx + 1}:
                </span>
                {phrase}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Textarea for Findings */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {inputMode === 'TEXT_FINDING'
            ? t.findingInput.textLabelModeText
            : t.findingInput.textLabelModeImage}
        </label>
        <textarea
          rows={3}
          value={textFinding}
          onChange={(e) => onChangeTextFinding(e.target.value)}
          placeholder={t.findingInput.placeholder}
          className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 leading-relaxed font-sans"
        />
      </div>

      {/* Primary & Copilot Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || (!textFinding.trim() && !hasCapturedImage)}
          className="flex-1 py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-teal-900/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
              <span>{t.findingInput.processing}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>{t.findingInput.generateBtn}</span>
            </>
          )}
        </button>

        {onOpenChat && (
          <button
            type="button"
            onClick={onOpenChat}
            className="py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-teal-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.station.discussRadia}</span>
          </button>
        )}
      </div>
    </div>
  );
};
