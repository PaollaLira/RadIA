import React, { useRef } from 'react';
import { UltrasoundSpecialty, TransducerType } from '../../types/ultrasound';
import { useLanguage } from '../../i18n/LanguageContext';
import { AppLanguage } from '../../i18n/translations';
import { cameraService } from '../../services/cameraService';
import { Camera, FileText, CheckCircle, Wand2, User, MessageSquare, Upload } from 'lucide-react';
import { BrandLoader } from '../common/BrandLoader';

interface FindingInputAreaProps {
  inputMode: 'CAMERA_IMAGE' | 'TEXT_FINDING';
  onChangeInputMode: (mode: 'CAMERA_IMAGE' | 'TEXT_FINDING') => void;
  patientName: string;
  onChangePatientName: (name: string) => void;
  patientCpf: string;
  onChangePatientCpf: (cpf: string) => void;
  patientBirthDate: string;
  onChangePatientBirthDate: (birthDate: string) => void;
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
  onUploadImage: (imageDataUrl: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasExistingReport?: boolean;
  viewerMeasurementsCount?: number;
  onOpenChat?: () => void;
}

const DEFAULT_TRANSDUCER_BY_SPECIALTY: Record<UltrasoundSpecialty, TransducerType> = {
  ABDOMEN: 'CONVEX',
  CERVICAL: 'LINEAR',
  THYROID: 'LINEAR',
  BREAST: 'LINEAR',
  AXILLAE: 'LINEAR',
  URINARY_KIDNEYS: 'CONVEX',
  POCUS_FAST: 'SECTOR',
  PELVIC_GYN: 'ENDOCAVITARY',
  OBSTETRIC_INITIAL: 'ENDOCAVITARY',
  OBSTETRIC_SECOND_TRIMESTER: 'CONVEX',
  OBSTETRIC_THIRD_TRIMESTER: 'CONVEX',
  VASCULAR_DOPPLER: 'LINEAR',
  SOFT_TISSUES: 'LINEAR',
  MSK_SHOULDER: 'LINEAR',
  MSK_ARM: 'LINEAR',
  MSK_ELBOW: 'LINEAR',
  MSK_FOREARM: 'LINEAR',
  MSK_WRIST: 'LINEAR',
  MSK_HAND: 'LINEAR',
  MSK_HIP: 'LINEAR',
  MSK_THIGH: 'LINEAR',
  MSK_KNEE: 'LINEAR',
  MSK_LEG: 'LINEAR',
  MSK_ANKLE: 'LINEAR',
  MSK_FOOT: 'LINEAR',
};

const QUICK_PHRASES: Record<AppLanguage, Partial<Record<UltrasoundSpecialty, string[]>>> = {
  pt: {
    ABDOMEN: [
      'Vesícula biliar distendida com cálculo de 19 mm impactado no colo, espessamento parietal de 5,4 mm com halo hipoecogênico, líquido perivesicular laminar e sinal de Murphy ultrassonográfico positivo.',
      'Fígado com aumento difuso da ecogenicidade e atenuação acústica posterior profunda, compatível com esteatose hepática moderada a grave. Demais órgãos abdominais sem alterações.',
      'Exame abdominal dentro dos limites da normalidade, sem lesões focais hepáticas, litíase biliar, dilatação pielocalicinal ou líquido livre.',
    ],
    CERVICAL: [
      'Linfonodomegalia cervical em cadeia jugulodigástrica direita (nível II) medindo 24 x 14 mm, aspecto reacional com hilo ecogênico preservado.',
      'Glândula submandibular direita aumentada de volume, heterogênea, com cálculo ductal hiperecogênico de 6 mm promovendo dilatação ductal a montante.',
    ],
    THYROID: [
      'Nódulo sólido marcadamente hipoecoico em terço médio do lobo direito medindo 15 x 11 x 13 mm. Relação mais alto que largo, margens microlobuladas e microcalcificações centrais puntiformes. ACR TI-RADS 5.',
      'Nódulo isoecoico espongiforme em lobo esquerdo medindo 12 mm, com halo fino hipoecoico regular completo e ausência de calcificações. ACR TI-RADS 2.',
      'Tireoide difusamente heterogênea e hipoecogênica com traves ecogênicas e micronodulações, compatível com tireoidite crônica autoimune (Hashimoto).',
    ],
    BREAST: [
      'Nódulo anecoico oval, circunscrito, de paredes finas e reforço acústico posterior límpido no QSE da mama esquerda às 2h, medindo 8 x 5 mm. Sem vascularização ao Doppler (BI-RADS 2).',
      'Nódulo hipoecoico de orientação não paralela à pele no QSL da mama direita medindo 14 x 11 mm, com margens espiculadas e sombra acústica posterior (BI-RADS 5).',
    ],
    AXILLAE: [
      'Linfonodo axilar esquerdo com espessamento cortical focal de 4,5 mm e perda parcial da definição do hilo gorduroso.',
      'Regiões axilares sem linfonodomegalias suspeitas, nódulos sólidos ou coleções líquidas; linfonodos habituais com córtex fino e hilo ecogênico preservado.',
    ],
    URINARY_KIDNEYS: [
      'Moderada a importante ectasia pielocalicinal no rim esquerdo (pelve 23 mm). Imagem hiperecogênica com 8 mm no terço distal do ureter esquerdo / junção ureterovesical, produzindo sombra acústica e artefato de cintilação.',
      'Cisto cortical simples no polo superior do rim direito medindo 32 mm, com paredes finas e conteúdo puramente anecoico (Bosniak I). Rins de dimensões normais.',
    ],
    POCUS_FAST: [
      'E-FAST Trauma: Presença de lâmina líquida anecoica franca em recesso hepatorrenal de Morrison (espessura 16 mm) e lâmina em recesso esplenorrenal. Janela pericárdica livre e deslizamento pleural preservado bilateralmente.',
      'FAST Negativo em 4 quadrantes abdominais. Ausência de líquido livre intraperitoneal em Morrison, esplenorrenal e escavação pélvica.',
    ],
    PELVIC_GYN: [
      'Útero em anteversoflexão de contornos regulares e miométrio homogêneo. Endométrio centrado e linear medindo 4 mm em fase pós-menopausa.',
      'Formação cística anexial direita com conteúdo espesso finamente particulado em "vidro fosco" medindo 42 mm, sugestiva de endometrioma ovariano.',
    ],
    OBSTETRIC_INITIAL: [
      'Saco gestacional tópico normoinserido, contendo vesícula vitelínica preservada e embrião único vivo com CCN de 18 mm (8s2d) e FCF de 162 bpm. Ausência de hematomas subcoriônicos.',
      'Feto único vivo com CCN de 58 mm (12s2d), translucência nucal medindo 1,4 mm, osso nasal presente e FCF de 156 bpm.',
    ],
    OBSTETRIC_SECOND_TRIMESTER: [
      'Gestação única tópica em situação longitudinal. Biometria fetal compatível com 21 semanas e 4 dias, peso fetal estimado de 435 g, placenta corporal anterior grau I e ILA normal.',
      'Avaliação morfológica do 2º trimestre sem malformações estruturais detectáveis; anatomia intracraniana, cardíaca (4 câmaras), abdominal e de membros preservada.',
    ],
    OBSTETRIC_THIRD_TRIMESTER: [
      'Feto único vivo em apresentação cefálica, biometria compatível com 34 semanas, peso fetal estimado de 2.350 g, placenta fúndico-posterior grau II, maior bolsão vertical de 4,8 cm e Dopplerfluxometria umbilical/ACM normal.',
      'Restrição de crescimento fetal tardia (peso fetal estimado abaixo do percentil 10 para 36 semanas), com aumento da resistência da artéria umbilical e relação cérebro-placentária reduzida.',
    ],
    VASCULAR_DOPPLER: [
      'Veia femoral comum e veia poplítea esquerdas incompressíveis à manobra do transdutor, com conteúdo ecogênico intraluminal e ausência de fluxo ao Doppler colorido e espectral (Trombose Venosa Profunda Aguda).',
      'Bulbos e bifurcações carotídeas sem placas ateromatosas estenosantes significativas. Velocidades de pico sistólico normais bilateralmente.',
    ],
    SOFT_TISSUES: [
      'Formação nodular ovalada, bem delimitada, isoecogênica com estrias lineares ecogênicas em plano subcutâneo medindo 28 x 12 mm, compatível com lipoma subcutâneo.',
      'Defeito aponeurótico na região umbilical medindo 14 mm com insinuação de conteúdo adiposo omental à manobra de Valsalva, redutível ao repouso (hérnia umbilical).',
    ],
    MSK_SHOULDER: [
      'Tendão do supraespinal espessado e heterogêneo com rotura parcial articular de 7 mm próximo à inserção na tuberosidade maior. Discreto líquido na bursa subacromial-subdeltoidea.',
      'Tendinopatia calcária do supraespinal com foco hiperecogênico de 9 mm promovendo sombra acústica posterior. Demais tendões do manguito rotador íntegros.',
    ],
    MSK_ARM: [
      'Ventres musculares do bíceps braquial e braquial anterior com ecotextura fibrilar preservada. Sem coleções, roturas musculares ou massas sólidas.',
      'Rotura parcial da junção miotendínea distal do bíceps braquial com pequeno hematoma hipoecogênico laminar associado (18 x 6 mm).',
    ],
    MSK_ELBOW: [
      'Tendão extensor comum no epicôndilo lateral espessado e hipoecoico com focos de hiperemia ao Doppler de amplitude, compatível com epicondilite lateral.',
      'Distensão líquida discreta da bursa olecraniana com espessamento sinovial focal.',
    ],
    MSK_FOREARM: [
      'Planos musculares dos compartimentos flexor e extensor do antebraço com arquitetura fibrilar preservada, sem coleções ou lesões focais.',
      'Estiramento muscular grau II no ventre do flexor radial do carpo com área de descontinuidade focal de 12 mm e edema interfascial.',
    ],
    MSK_WRIST: [
      'Cisto sinovial (ganglion) anecoico multiloculado em face dorsal do punho medindo 13 x 7 mm, com colo comunicante junto à articulação escafossemilunar.',
      'Espessamento da bainha sinovial do 1º compartimento extensor (abdutor longo e extensor curto do polegar) com líquido peritendíneo (tenossinovite de De Quervain).',
    ],
    MSK_HAND: [
      'Espessamento focal da polia A1 do 3º quirodáctilo associado a edema da bainha dos tendões flexores (dedo em gatilho / tenossinovite estenosante).',
      'Pequeno cisto sinovial volar junto à articulação metacarpofalângica do 2º dedo medindo 6 x 4 mm.',
    ],
    MSK_HIP: [
      'Derrame articular coxofemoral com distensão do recesso capsular anterior medindo 8 mm (assimetria > 2 mm em relação ao contralateral).',
      'Tendinopatia insercional do glúteo médio associada a discreta distensão líquida da bursa trocantérica.',
    ],
    MSK_THIGH: [
      'Lesão muscular grau II no reto femoral (terço médio) com descontinuidade parcial de fibras e pequena coleção hemática de 25 x 9 mm.',
      'Musculatura dos compartimentos anterior, medial e posterior da coxa com ecotextura fibrilar habitual, sem roturas ou hematomas.',
    ],
    MSK_KNEE: [
      'Derrame articular moderado no recesso suprapatelar. Cisto de Baker anecoico em fossa poplítea medindo 34 x 14 mm, sem sinais de rotura.',
      'Tendinopatia patelar proximal com espessamento focal (6,5 mm) e hipoecogenicidade junto ao polo inferior da patela.',
    ],
    MSK_LEG: [
      'Rotura parcial da junção miotendínea medial do músculo gastrocnêmio ("tennis leg") com coleção líquida anecoica/hipoecogênica laminar de 32 x 8 mm.',
      'Ventres musculares da perna com arquitetura preservada, sem coleções ou achados sugestivos de TVP nos segmentos avaliados.',
    ],
    MSK_ANKLE: [
      'Rotura completa do ligamento talofibular anterior (LTFA) com descontinuidade das fibras, edema pericapsular e pequeno derrame articular tibiotalar.',
      'Tendinopatia do tendão calcâneo (Aquiles) em seu terço médio, espessado (8,2 mm) e heterogêneo, sem rotura completa.',
    ],
    MSK_FOOT: [
      'Fáscia plantar espessada na inserção calcânea medindo 5,8 mm e hipoecoica, compatível com fascite plantar.',
      'Lesão hipoecogênica bem delimitada no 3º espaço intermetatarsal medindo 8 x 5 mm, sugestiva de neuroma de Morton.',
    ],
  },
  en: {
    ABDOMEN: [
      'Distended gallbladder with a 19 mm calculus impacted at the neck, 5.4 mm wall thickening with hypoechoic mural halo, pericholecystic fluid, and positive sonographic Murphy sign.',
      'Liver with diffusely increased echogenicity and deep posterior acoustic attenuation, consistent with moderate-to-severe hepatic steatosis. Remaining abdominal organs unremarkable.',
    ],
    CERVICAL: [
      'Enlarged right jugulodigastric (level II) lymph node measuring 24 x 14 mm, reactive appearance with preserved fatty hilum.',
      'Enlarged, heterogeneous right submandibular gland with a 6 mm hyperechoic sialolith causing proximal ductal dilation.',
    ],
    THYROID: [
      'Markedly hypoechoic solid nodule in the mid right thyroid lobe measuring 15 x 11 x 13 mm. Taller-than-wide shape, microlobulated margins, and punctate echogenic foci. ACR TI-RADS 5.',
      'Spongiform isoechoic nodule in the left lobe measuring 12 mm, with a thin regular halo and no calcifications. ACR TI-RADS 2.',
    ],
    BREAST: [
      'Oval, circumscribed anechoic cyst with thin walls and crisp posterior acoustic enhancement in the left breast UOQ at 2 o’clock, measuring 8 x 5 mm. No internal Doppler flow (BI-RADS 2).',
      'Anti-parallel hypoechoic solid mass in the right breast UOQ measuring 14 x 11 mm, with spiculated margins and posterior acoustic shadowing (BI-RADS 5).',
    ],
    AXILLAE: [
      'Left axillary lymph node demonstrating focal cortical thickening (4.5 mm) and partial effacement of the fatty hilum.',
      'Bilateral axillae without suspicious lymphadenopathy, focal solid masses, or fluid collections; normal nodes with preserved fatty hila.',
    ],
    URINARY_KIDNEYS: [
      'Moderate-to-severe left pelvicalyceal ectasia (renal pelvis 23 mm). Hyperechoic 8 mm calculus at the distal left ureter / UVJ producing posterior acoustic shadowing and twinkling artifact.',
      'Simple cortical cyst in the upper pole of the right kidney measuring 32 mm, thin walls, purely anechoic content (Bosniak I). Normal renal dimensions.',
    ],
    POCUS_FAST: [
      'E-FAST Trauma: Frank anechoic free fluid stripe in the hepatorenal recess / Morison pouch (16 mm depth) and splenorenal recess. Clear pericardial window and preserved bilateral lung sliding.',
      'Negative 4-quadrant abdominal FAST. No intraperitoneal free fluid in Morison pouch, splenorenal recess, or pelvic cul-de-sac.',
    ],
    PELVIC_GYN: [
      'Anteverted uterus with smooth contours and homogeneous myometrium. Centered linear endometrium measuring 4 mm in postmenopausal status.',
      'Right adnexal cystic lesion with homogeneous low-level internal echoes ("ground-glass" appearance) measuring 42 mm, suggestive of ovarian endometrioma.',
    ],
    OBSTETRIC_INITIAL: [
      'Single live intrauterine embryo with CRL 18 mm (8w2d), yolk sac intact, FHR 162 bpm. No subchorionic hematoma.',
      'Single live fetus with CRL 58 mm (12w2d), nuchal translucency 1.4 mm, nasal bone present, FHR 156 bpm.',
    ],
    OBSTETRIC_SECOND_TRIMESTER: [
      'Single live intrauterine fetus in longitudinal lie; biometry consistent with 21w4d, EFW 435 g, anterior grade I placenta, normal amniotic fluid.',
      'Second-trimester anatomical survey without detectable structural anomalies; normal intracranial, four-chamber cardiac, abdominal, and extremity views.',
    ],
    OBSTETRIC_THIRD_TRIMESTER: [
      'Single live fetus in cephalic presentation, biometry consistent with 34 weeks, EFW 2,350 g, posterior grade II placenta, SDP 4.8 cm, normal umbilical/MCA Doppler.',
      'Late fetal growth restriction (EFW < 10th percentile at 36 weeks) with elevated umbilical artery PI and reduced cerebroplacental ratio.',
    ],
    VASCULAR_DOPPLER: [
      'Non-compressible left common femoral and popliteal veins with intraluminal echogenic thrombus and absent color/spectral Doppler flow (Acute Deep Vein Thrombosis).',
      'Bilateral carotid bulbs and bifurcations without hemodynamically significant stenotic plaque. Normal peak systolic velocities bilaterally.',
    ],
    SOFT_TISSUES: [
      'Oval, well-circumscribed, mildly echogenic subcutaneous nodule with fine linear striations measuring 28 x 12 mm, consistent with a subcutaneous lipoma.',
      'Umbilical fascial defect measuring 14 mm with reducible omental fat herniation during Valsalva maneuver.',
    ],
    MSK_SHOULDER: [
      'Thickened, heterogeneous supraspinatus tendon with a 7 mm articular-sided partial-thickness tear near the greater tuberosity footprint. Mild subacromial-subdeltoid bursal fluid.',
    ],
    MSK_WRIST: [
      'Multiloculated anechoic dorsal wrist ganglion cyst measuring 13 x 7 mm communicating with the scapholunate joint.',
      'Thickened 1st extensor compartment synovial sheath (APL/EPB) with surrounding fluid (De Quervain tenosynovitis).',
    ],
    MSK_KNEE: [
      'Moderate suprapatellar joint effusion. Anechoic popliteal Baker cyst measuring 34 x 14 mm without signs of rupture.',
    ],
    MSK_ANKLE: [
      'Complete tear of the anterior talofibular ligament (ATFL) with fiber discontinuity, pericapsular edema, and small tibiotalar effusion.',
    ],
  },
  es: {
    ABDOMEN: [
      'Vesícula biliar distendida con cálculo de 19 mm enclavado en el cuello, engrosamiento parietal de 5,4 mm con halo hipoecogénico, líquido pericolecístico laminar y signo de Murphy ecográfico positivo.',
      'Hígado con aumento difuso de la ecogenicidad y atenuación acústica posterior, compatible con esteatosis hepática moderada a grave. Resto de órganos abdominales sin alteraciones.',
    ],
    CERVICAL: [
      'Adenomegalia cervical reactiva en cadena yugulodigástrica derecha (nivel II) de 24 x 14 mm, con hilio graso ecogénico conservado.',
      'Glándula submandibular derecha aumentada de tamaño, heterogénea, con sialolito hiperecogénico de 6 mm y dilatación ductal retrógrada.',
    ],
    THYROID: [
      'Nódulo sólido marcadamente hipoecogénico en el tercio medio del lóbulo derecho de 15 x 11 x 13 mm. Más alto que ancho, márgenes microlobulados y microcalcificaciones puntiformes. ACR TI-RADS 5.',
      'Nódulo isoecogénico espongiforme en lóbulo izquierdo de 12 mm, con halo fino regular y sin calcificaciones. ACR TI-RADS 2.',
    ],
    BREAST: [
      'Quiste anecoico ovalado, circunscrito, de paredes finas y refuerzo acústico posterior en el CSE de la mama izquierda (radio 2 h), de 8 x 5 mm. Sin flujo Doppler (BI-RADS 2).',
      'Nódulo sólido hipoecogénico de orientación no paralela en el CSE de la mama derecha de 14 x 11 mm, con márgenes espiculados y sombra acústica posterior (BI-RADS 5).',
    ],
    AXILLAE: [
      'Ganglio axilar izquierdo con engrosamiento cortical focal de 4,5 mm y borramiento parcial del hilio graso.',
      'Regiones axilares sin adenomegalias sospechosas ni colecciones líquidas; ganglios de aspecto habitual con hilio conservado.',
    ],
    URINARY_KIDNEYS: [
      'Ectasia pielocalicial izquierda moderada a grave (pelvis de 23 mm). Cálculo hiperecogénico de 8 mm en uréter distal izquierdo / unión ureterovesical con sombra acústica y artefacto de centelleo.',
      'Quiste cortical simple en polo superior del riñón derecho de 32 mm, paredes finas y contenido anecoico puro (Bosniak I).',
    ],
    POCUS_FAST: [
      'E-FAST Trauma: Lámina de líquido libre anecoico en el espacio hepatorrenal de Morrison (16 mm) y en el receso esplenorrenal. Ventana pericárdica libre y deslizamiento pleural bilateral conservado.',
      'FAST negativo en los 4 cuadrantes abdominales. Sin líquido libre intraperitoneal.',
    ],
    PELVIC_GYN: [
      'Útero en anteversoflexión de contornos regulares y miometrio homogéneo. Endometrio lineal de 4 mm en paciente posmenopáusica.',
      'Lesión quística anexial derecha con ecos internos finos en "vidrio esmerilado" de 42 mm, sugestiva de endometrioma ovárico.',
    ],
    OBSTETRIC_INITIAL: [
      'Saco gestacional normoinserto con vesícula vitelina conservada y embrión único vivo con LCC de 18 mm (8s2d) y FCF de 162 lpm. Sin hematomas subcoriónicos.',
      'Feto único vivo con LCC de 58 mm (12s2d), translucencia nucal de 1,4 mm, hueso nasal presente y FCF de 156 lpm.',
    ],
    OBSTETRIC_SECOND_TRIMESTER: [
      'Gestación única con biometría acorde a 21s4d, peso fetal estimado de 435 g, placenta anterior grado I y líquido amniótico normal.',
      'Ecografía morfológica del segundo trimestre sin malformaciones estructurales detectables.',
    ],
    OBSTETRIC_THIRD_TRIMESTER: [
      'Feto único vivo en presentación cefálica, biometría acorde a 34 semanas, PFE de 2.350 g, placenta posterior grado II, bolsillo máximo vertical de 4,8 cm y Doppler normal.',
      'Restricción del crecimiento fetal tardío (PFE < p10 para 36 semanas) con aumento de resistencia en arteria umbilical.',
    ],
    VASCULAR_DOPPLER: [
      'Venas femoral común y poplítea izquierdas no compresibles, con material ecogénico intraluminal y ausencia de flujo Doppler (Trombosis Venosa Profunda Aguda).',
      'Bifurcaciones carotídeas sin placas estenosantes hemodinámicamente significativas. Velocidades sistólicas normales bilateralmente.',
    ],
    SOFT_TISSUES: [
      'Nódulo subcutáneo ovalado, bien delimitado, con estriaciones lineales finas de 28 x 12 mm, compatible con lipoma subcutáneo.',
      'Defecto aponeurótico umbilical de 14 mm con protrusión de grasa omental reducible tras Valsalva.',
    ],
    MSK_SHOULDER: [
      'Tendón del supraespinoso engrosado y heterogéneo con rotura parcial articular de 7 mm próxima a su inserción. Discreto líquido en bursa subacromio-subdeltoidea.',
    ],
    MSK_WRIST: [
      'Quiste sinovial (ganglión) dorsal anecoico multiloculado de 13 x 7 mm en comunicación con la articulación escafosemilunar.',
    ],
    MSK_KNEE: [
      'Derrame articular suprapatelar moderado. Quiste de Baker anecoico en hueco poplíteo de 34 x 14 mm sin signos de rotura.',
    ],
    MSK_ANKLE: [
      'Rotura completa del ligamento peroneoastragalino anterior (LPAA) con discontinuidad fibrilar y derrame articular tibiotalar.',
    ],
  },
};

const GENERAL_SPECIALTIES: UltrasoundSpecialty[] = [
  'ABDOMEN',
  'CERVICAL',
  'THYROID',
  'BREAST',
  'AXILLAE',
  'URINARY_KIDNEYS',
  'POCUS_FAST',
  'PELVIC_GYN',
  'VASCULAR_DOPPLER',
  'SOFT_TISSUES',
];

const OBSTETRIC_SPECIALTIES: UltrasoundSpecialty[] = [
  'OBSTETRIC_INITIAL',
  'OBSTETRIC_SECOND_TRIMESTER',
  'OBSTETRIC_THIRD_TRIMESTER',
];

const MSK_SPECIALTIES: UltrasoundSpecialty[] = [
  'MSK_SHOULDER',
  'MSK_ARM',
  'MSK_ELBOW',
  'MSK_FOREARM',
  'MSK_WRIST',
  'MSK_HAND',
  'MSK_HIP',
  'MSK_THIGH',
  'MSK_KNEE',
  'MSK_LEG',
  'MSK_ANKLE',
  'MSK_FOOT',
];

export const FindingInputArea: React.FC<FindingInputAreaProps> = ({
  inputMode,
  onChangeInputMode,
  patientName,
  onChangePatientName,
  patientCpf,
  onChangePatientCpf,
  patientBirthDate,
  onChangePatientBirthDate,
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
  onUploadImage,
  onAnalyze,
  isAnalyzing,
  hasExistingReport = false,
  viewerMeasurementsCount = 0,
  onOpenChat,
}) => {
  const { lang, t } = useLanguage();
  const photoUploadRef = useRef<HTMLInputElement>(null);

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const compressed = await cameraService.compressImageFile(file);
      onUploadImage(compressed);
    } catch (err) {
      console.error('Erro ao carregar foto do exame:', err);
    }
  };

  const handleApplyPresetPhrase = (phrase: string) => {
    onChangeTextFinding(phrase);
  };

  const handleCpfInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    const formatted = digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
    onChangePatientCpf(formatted);
  };

  const handleBirthDateInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    onChangePatientBirthDate(formatted);
  };

  const quickPhrasesForSpecialty = specialty ? QUICK_PHRASES[lang][specialty] : undefined;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 text-slate-800 dark:text-slate-200 max-w-full overflow-hidden">
      {/* Selector: Camera vs Confirmed Finding */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="min-w-0">
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

      {/* Patient Name, CPF, Sex, Birth Date & Age Inputs for Report */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3.5">
        <div className="sm:col-span-6 min-w-0">
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
              className="w-full min-w-0 max-w-full box-border text-xs sm:text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div className="sm:col-span-3 min-w-0">
          <label
            htmlFor="finding-patient-cpf"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            {t.findingInput.cpfLabel}
          </label>
          <input
            id="finding-patient-cpf"
            type="text"
            inputMode="numeric"
            maxLength={14}
            value={patientCpf}
            onChange={(e) => handleCpfInput(e.target.value)}
            placeholder={t.findingInput.cpfPlaceholder}
            className="w-full min-w-0 max-w-full box-border text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
          />
        </div>

        <div className="sm:col-span-3 min-w-0">
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
            className="w-full min-w-0 max-w-full box-border text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="F">{t.report.female}</option>
            <option value="M">{t.report.male}</option>
            <option value="Outro">{t.report.other}</option>
          </select>
        </div>

        <div className="sm:col-span-6 min-w-0">
          <label
            htmlFor="finding-patient-birth-date"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
          >
            {t.findingInput.birthDateLabel}
          </label>
          <input
            id="finding-patient-birth-date"
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            maxLength={10}
            value={patientBirthDate}
            onChange={(e) => handleBirthDateInput(e.target.value)}
            placeholder={t.findingInput.birthDatePlaceholder}
            className="w-full min-w-0 max-w-full box-border text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
          />
        </div>

        <div className="sm:col-span-6 min-w-0">
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
            className="w-full min-w-0 max-w-full box-border text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>
      </div>

      {/* Specialty and Transducer Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="min-w-0">
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
            className="w-full min-w-0 max-w-full box-border text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="">{t.findingInput.specialtyPlaceholder}</option>
            <optgroup label={t.specialtyGroups.general}>
              {GENERAL_SPECIALTIES.map((key) => (
                <option key={key} value={key}>
                  {t.specialties[key]}
                </option>
              ))}
            </optgroup>
            <optgroup label={t.specialtyGroups.obstetric}>
              {OBSTETRIC_SPECIALTIES.map((key) => (
                <option key={key} value={key}>
                  {t.specialties[key]}
                </option>
              ))}
            </optgroup>
            <optgroup label={t.specialtyGroups.msk}>
              {MSK_SPECIALTIES.map((key) => (
                <option key={key} value={key}>
                  {t.specialties[key]}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="min-w-0">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t.findingInput.transducerLabel}
          </label>
          <select
            value={transducer}
            onChange={(e) => onChangeTransducer(e.target.value as TransducerType | '')}
            className="w-full min-w-0 max-w-full box-border text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <option value="">{t.findingInput.transducerPlaceholder}</option>
            <option value="CONVEX">{t.transducers.CONVEX}</option>
            <option value="LINEAR">{t.transducers.LINEAR}</option>
            <option value="SECTOR">{t.transducers.SECTOR}</option>
            <option value="ENDOCAVITARY">{t.transducers.ENDOCAVITARY}</option>
          </select>
        </div>
      </div>

      <input
        ref={photoUploadRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileChange}
        className="hidden"
      />

      {/* Mode A: Camera Capture & Photo Upload */}
      {inputMode === 'CAMERA_IMAGE' ? (
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
          <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenLiveCamera}
              className="px-4 py-2.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Camera className="w-4 h-4" />
              <span>{hasCapturedImage ? t.findingInput.retakePhoto : t.findingInput.openCameraBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => photoUploadRef.current?.click()}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4 text-teal-700 dark:text-cyan-400" />
              <span>{hasCapturedImage ? t.findingInput.changePhoto : t.findingInput.uploadPhotoBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            {hasCapturedImage ? (
              <CheckCircle className="w-4 h-4 text-teal-600 dark:text-cyan-400 shrink-0" />
            ) : (
              <Camera className="w-4 h-4 text-teal-700 dark:text-cyan-400 shrink-0" />
            )}
            <span>
              {hasCapturedImage ? t.findingInput.photoLoaded : t.findingInput.attachPhotoHint}
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenLiveCamera}
              className="px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t.findingInput.openCameraBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => photoUploadRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-teal-700 dark:text-cyan-400" />
              <span>{t.findingInput.uploadPhotoBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Clinical Shortcuts */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <Wand2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>{t.findingInput.quickShortcuts}</span>
        </div>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => handleApplyPresetPhrase(t.findingInput.noFindingsShortcut)}
            className="w-full text-left p-2 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors text-slate-700 dark:text-slate-300"
          >
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 mr-1.5">
              {t.findingInput.normalPrefix}:
            </span>
            {t.findingInput.noFindingsShortcut}
          </button>
          {quickPhrasesForSpecialty?.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
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
              <BrandLoader size="sm" />
              <span>{t.findingInput.processing}</span>
            </>
          ) : (
            <span>
              {hasExistingReport
                ? t.findingInput.regenerateBtn
                : t.findingInput.generateBtn}
              {viewerMeasurementsCount > 0
                ? ` (${viewerMeasurementsCount} ${
                    viewerMeasurementsCount === 1
                      ? lang === 'en'
                        ? 'meas.'
                        : 'med.'
                      : lang === 'en'
                        ? 'meas.'
                        : 'meds.'
                  })`
                : ''}
            </span>
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
