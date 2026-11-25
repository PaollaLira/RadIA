import { AppLanguage } from '../i18n/translations';

export type ReferenceGroup = 'fetal' | 'pediatric' | 'adult';
export type FetalTrimester = 'first' | 'second' | 'third';

export type PediatricAgeBandId =
  | 'newborn'
  | 'infant1to6m'
  | 'infant6to12m'
  | 'toddler1to3y'
  | 'child4to6y'
  | 'child7to10y'
  | 'preteen11to14y'
  | 'teen15to17y';

export interface BilingualText {
  pt: string;
  en: string;
}

export interface ReferenceMeasurement {
  id: string;
  group: ReferenceGroup;
  trimester?: FetalTrimester;
  category: BilingualText;
  structure: BilingualText;
  normalRange: BilingualText;
  unit: string;
  minVal?: number;
  maxVal?: number;
  clinicalNote: BilingualText;
}

export interface PediatricOrganRow {
  ageBand: PediatricAgeBandId;
  normalRange: BilingualText;
  minVal?: number;
  maxVal?: number;
  note?: BilingualText;
}

export interface PediatricOrganTable {
  id: string;
  organ: BilingualText;
  parameter: BilingualText;
  unit: string;
  generalNote: BilingualText;
  rows: PediatricOrganRow[];
}

export const PEDIATRIC_AGE_BANDS: Array<{ id: PediatricAgeBandId; label: BilingualText }> = [
  { id: 'newborn', label: { pt: 'RN (0–28d)', en: 'Newborn (0–28d)' } },
  { id: 'infant1to6m', label: { pt: '1–6 meses', en: '1–6 months' } },
  { id: 'infant6to12m', label: { pt: '6–12 meses', en: '6–12 months' } },
  { id: 'toddler1to3y', label: { pt: '1–3 anos', en: '1–3 yrs' } },
  { id: 'child4to6y', label: { pt: '4–6 anos', en: '4–6 yrs' } },
  { id: 'child7to10y', label: { pt: '7–10 anos', en: '7–10 yrs' } },
  { id: 'preteen11to14y', label: { pt: '11–14 anos', en: '11–14 yrs' } },
  { id: 'teen15to17y', label: { pt: '15–17 anos', en: '15–17 yrs' } },
];

export const FETAL_MEASUREMENTS: ReferenceMeasurement[] = [
  // 1º Trimestre
  {
    id: 'fet-1-sg',
    group: 'fetal',
    trimester: 'first',
    category: { pt: '1º Trimestre (4–13s6d)', en: '1st Trimester (4–13w6d)' },
    structure: {
      pt: 'Saco Gestacional (Diâmetro Médio - DMS)',
      en: 'Gestational Sac (Mean Sac Diameter - MSD)',
    },
    normalRange: {
      pt: '4,5s: 2–3 mm · 6s: 10–15 mm · 8s: 24–28 mm',
      en: '4.5w: 2–3 mm · 6w: 10–15 mm · 8w: 24–28 mm',
    },
    unit: 'mm',
    clinicalNote: {
      pt: 'Crescimento esperado ~1,0–1,2 mm/dia. Vesícula vitelínica visível com DMS ≥ 8–10 mm e embrião com DMS ≥ 25 mm.',
      en: 'Expected growth ~1.0–1.2 mm/day. Yolk sac expected at MSD ≥ 8–10 mm and embryo at MSD ≥ 25 mm.',
    },
  },
  {
    id: 'fet-1-vv',
    group: 'fetal',
    trimester: 'first',
    category: { pt: '1º Trimestre (4–13s6d)', en: '1st Trimester (4–13w6d)' },
    structure: {
      pt: 'Vesícula Vitelínica (VV)',
      en: 'Yolk Sac (YS)',
    },
    normalRange: { pt: '2,0 a 6,0', en: '2.0 to 6.0' },
    unit: 'mm',
    minVal: 2.0,
    maxVal: 6.0,
    clinicalNote: {
      pt: 'Visível a partir de ~5,5 semanas. Diâmetro > 6,0–7,0 mm ou morfologia irregular associa-se a maior risco gestacional.',
      en: 'Visible from ~5.5 weeks. Diameter > 6.0–7.0 mm or irregular shape is associated with increased pregnancy loss risk.',
    },
  },
  {
    id: 'fet-1-ccn',
    group: 'fetal',
    trimester: 'first',
    category: { pt: '1º Trimestre (4–13s6d)', en: '1st Trimester (4–13w6d)' },
    structure: {
      pt: 'Comprimento Cabeça-Nádega (CCN / CRL)',
      en: 'Crown-Rump Length (CRL)',
    },
    normalRange: {
      pt: '6s: 4–6 · 8s: 15–17 · 10s: 31–33 · 12s: 52–56 · 13s6d: 75–84',
      en: '6w: 4–6 · 8w: 15–17 · 10w: 31–33 · 12w: 52–56 · 13w6d: 75–84',
    },
    unit: 'mm',
    minVal: 2.0,
    maxVal: 84.0,
    clinicalNote: {
      pt: 'Parâmetro mais preciso para datação da idade gestacional no 1º trimestre (erro ± 3–5 dias).',
      en: 'Most accurate parameter for 1st trimester gestational age dating (± 3–5 days).',
    },
  },
  {
    id: 'fet-1-fcf',
    group: 'fetal',
    trimester: 'first',
    category: { pt: '1º Trimestre (4–13s6d)', en: '1st Trimester (4–13w6d)' },
    structure: {
      pt: 'Frequência Cardíaca Fetal (FCF)',
      en: 'Fetal Heart Rate (FHR)',
    },
    normalRange: {
      pt: '6s: 90–115 · 7–8s: 120–160 · 9–13s: 140–170',
      en: '6w: 90–115 · 7–8w: 120–160 · 9–13w: 140–170',
    },
    unit: 'bpm',
    minVal: 110,
    maxVal: 175,
    clinicalNote: {
      pt: 'Embrião ≥ 7 mm sem batimentos cardíacos sugere falha gestacional precoce (critério SRU).',
      en: 'Embryo ≥ 7 mm with absent cardiac activity is diagnostic of early pregnancy failure (SRU criteria).',
    },
  },
  {
    id: 'fet-1-tn',
    group: 'fetal',
    trimester: 'first',
    category: { pt: '1º Trimestre (11–13s6d)', en: '1st Trimester (11–13w6d)' },
    structure: {
      pt: 'Translucência Nucal (TN)',
      en: 'Nuchal Translucency (NT)',
    },
    normalRange: {
      pt: '< 2,5 (p95 varia ~2,1 a 2,8 para CCN 45–84 mm)',
      en: '< 2.5 (95th percentile ~2.1–2.8 for CRL 45–84 mm)',
    },
    unit: 'mm',
    minVal: 0.5,
    maxVal: 2.5,
    clinicalNote: {
      pt: 'Corte sagital mediano estrito em posição neutra (critérios FMF). TN ≥ 3,5 mm indica investigação detalhada.',
      en: 'Strict midsagittal view in neutral position (FMF criteria). NT ≥ 3.5 mm warrants targeted diagnostic evaluation.',
    },
  },

  // 2º Trimestre
  {
    id: 'fet-2-dbp',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (14–27s6d)', en: '2nd Trimester (14–27w6d)' },
    structure: { pt: 'Diâmetro Biparietal (DBP)', en: 'Biparietal Diameter (BPD)' },
    normalRange: {
      pt: '16s: 32–36 · 20s: 45–49 · 24s: 58–62 · 27s: 66–71',
      en: '16w: 32–36 · 20w: 45–49 · 24w: 58–62 · 27w: 66–71',
    },
    unit: 'mm',
    minVal: 25,
    maxVal: 72,
    clinicalNote: {
      pt: 'Plano transtalâmico incluindo tálamos, cavum do septo pelúcido e foice cerebral.',
      en: 'Transthalamic plane including thalami, cavum septi pellucidi, and falx cerebri.',
    },
  },
  {
    id: 'fet-2-cc',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (14–27s6d)', en: '2nd Trimester (14–27w6d)' },
    structure: { pt: 'Circunferência Cefálica (CC / HC)', en: 'Head Circumference (HC)' },
    normalRange: {
      pt: '16s: 118–132 · 20s: 168–182 · 24s: 212–228 · 27s: 243–260',
      en: '16w: 118–132 · 20w: 168–182 · 24w: 212–228 · 27w: 243–260',
    },
    unit: 'mm',
    minVal: 95,
    maxVal: 265,
    clinicalNote: {
      pt: 'Menos suscetível a variações de formato craniano (dolicocefalia/braquicefalia) que o DBP isolado.',
      en: 'Less affected by fetal head shape variations (dolichocephaly/brachycephaly) than BPD alone.',
    },
  },
  {
    id: 'fet-2-ca',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (14–27s6d)', en: '2nd Trimester (14–27w6d)' },
    structure: { pt: 'Circunferência Abdominal (CA / AC)', en: 'Abdominal Circumference (AC)' },
    normalRange: {
      pt: '16s: 98–112 · 20s: 142–158 · 24s: 185–205 · 27s: 218–240',
      en: '16w: 98–112 · 20w: 142–158 · 24w: 185–205 · 27w: 218–240',
    },
    unit: 'mm',
    minVal: 80,
    maxVal: 245,
    clinicalNote: {
      pt: 'Corte abdominal circular contendo estômago, veia porta umbilical ("J") e arcos costais simétricos.',
      en: 'Circular abdominal plane with stomach bubble, umbilical portion of left portal vein ("J"), and symmetric ribs.',
    },
  },
  {
    id: 'fet-2-cf',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (14–27s6d)', en: '2nd Trimester (14–27w6d)' },
    structure: { pt: 'Comprimento do Fêmur (CF / FL)', en: 'Femur Length (FL)' },
    normalRange: {
      pt: '16s: 19–23 · 20s: 31–35 · 24s: 41–46 · 27s: 49–53',
      en: '16w: 19–23 · 20w: 31–35 · 24w: 41–46 · 27w: 49–53',
    },
    unit: 'mm',
    minVal: 14,
    maxVal: 54,
    clinicalNote: {
      pt: 'Medir apenas a diáfise ossificada, mantendo ângulo próximo de 90° com o feixe sonoro.',
      en: 'Measure only the ossified diaphysis perpendicular to the ultrasound beam.',
    },
  },
  {
    id: 'fet-2-ventriculo',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (Morfológico)', en: '2nd Trimester (Anatomy)' },
    structure: {
      pt: 'Átrio do Ventrículo Lateral Cerebral',
      en: 'Cerebral Lateral Ventricle Atrium',
    },
    normalRange: { pt: '< 10,0 (média ~6–8 mm)', en: '< 10.0 (mean ~6–8 mm)' },
    unit: 'mm',
    minVal: 3.0,
    maxVal: 9.9,
    clinicalNote: {
      pt: 'Ventriculomegalia leve: 10–12 mm | moderada: 12,1–15 mm | acentuada: > 15 mm.',
      en: 'Mild ventriculomegaly: 10–12 mm | moderate: 12.1–15 mm | severe: > 15 mm.',
    },
  },
  {
    id: 'fet-2-cisterna',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (Morfológico)', en: '2nd Trimester (Anatomy)' },
    structure: { pt: 'Cisterna Magna', en: 'Cisterna Magna' },
    normalRange: { pt: '2,0 a 10,0', en: '2.0 to 10.0' },
    unit: 'mm',
    minVal: 2.0,
    maxVal: 10.0,
    clinicalNote: {
      pt: 'Medida na fossa posterior no plano transcerebelar. Valores > 10 mm definem megacisterna magna.',
      en: 'Measured in the posterior fossa on the transcerebellar plane; > 10 mm indicates mega cisterna magna.',
    },
  },
  {
    id: 'fet-2-prega',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (16–22s)', en: '2nd Trimester (16–22w)' },
    structure: { pt: 'Prega Nucal', en: 'Nuchal Fold' },
    normalRange: { pt: '< 6,0', en: '< 6.0' },
    unit: 'mm',
    minVal: 1.0,
    maxVal: 5.9,
    clinicalNote: {
      pt: 'Medida no plano transcerebelar entre a borda externa do occipital e a borda externa da pele.',
      en: 'Measured on transcerebellar view from outer occipital bone to outer skin edge.',
    },
  },
  {
    id: 'fet-2-colo',
    group: 'fetal',
    trimester: 'second',
    category: { pt: '2º Trimestre (18–24s)', en: '2nd Trimester (18–24w)' },
    structure: {
      pt: 'Colo Uterino (Via Transvaginal)',
      en: 'Cervical Length (Transvaginal)',
    },
    normalRange: { pt: '≥ 25,0 (habitual 30–45 mm)', en: '≥ 25.0 (typical 30–45 mm)' },
    unit: 'mm',
    minVal: 25.0,
    maxVal: 55.0,
    clinicalNote: {
      pt: 'Comprimento < 25 mm antes de 24 semanas aumenta risco de parto pré-termo espontâneo.',
      en: 'Length < 25 mm prior to 24 weeks increases spontaneous preterm birth risk.',
    },
  },

  // 3º Trimestre
  {
    id: 'fet-3-dbp',
    group: 'fetal',
    trimester: 'third',
    category: { pt: '3º Trimestre (28–40s)', en: '3rd Trimester (28–40w)' },
    structure: { pt: 'Diâmetro Biparietal (DBP)', en: 'Biparietal Diameter (BPD)' },
    normalRange: {
      pt: '28s: 69–73 · 32s: 78–83 · 36s: 86–92 · 40s: 91–97',
      en: '28w: 69–73 · 32w: 78–83 · 36w: 86–92 · 40w: 91–97',
    },
    unit: 'mm',
    minVal: 66,
    maxVal: 99,
    clinicalNote: {
      pt: 'Correlacionar com CC e CA para avaliar simetria do crescimento fetal.',
      en: 'Correlate with HC and AC to assess fetal growth symmetry.',
    },
  },
  {
    id: 'fet-3-cc',
    group: 'fetal',
    trimester: 'third',
    category: { pt: '3º Trimestre (28–40s)', en: '3rd Trimester (28–40w)' },
    structure: { pt: 'Circunferência Cefálica (CC / HC)', en: 'Head Circumference (HC)' },
    normalRange: {
      pt: '28s: 255–272 · 32s: 288–306 · 36s: 314–333 · 40s: 332–353',
      en: '28w: 255–272 · 32w: 288–306 · 36w: 314–333 · 40w: 332–353',
    },
    unit: 'mm',
    minVal: 245,
    maxVal: 360,
    clinicalNote: {
      pt: 'A relação CC/CA ajuda a diferenciar RCIU simétrica de assimétrica.',
      en: 'HC/AC ratio helps distinguish symmetric vs asymmetric fetal growth restriction.',
    },
  },
  {
    id: 'fet-3-ca',
    group: 'fetal',
    trimester: 'third',
    category: { pt: '3º Trimestre (28–40s)', en: '3rd Trimester (28–40w)' },
    structure: { pt: 'Circunferência Abdominal (CA / AC)', en: 'Abdominal Circumference (AC)' },
    normalRange: {
      pt: '28s: 230–252 · 32s: 268–294 · 36s: 305–334 · 40s: 335–368',
      en: '28w: 230–252 · 32w: 268–294 · 36w: 305–334 · 40w: 335–368',
    },
    unit: 'mm',
    minVal: 220,
    maxVal: 375,
    clinicalNote: {
      pt: 'Parâmetro mais sensível para rastreamento de RCIU (< p10) e macrossomia (> p90).',
      en: 'Most sensitive biometric parameter for FGR (< 10th percentile) and macrosomia (> 90th percentile).',
    },
  },
  {
    id: 'fet-3-cf',
    group: 'fetal',
    trimester: 'third',
    category: { pt: '3º Trimestre (28–40s)', en: '3rd Trimester (28–40w)' },
    structure: { pt: 'Comprimento do Fêmur (CF / FL)', en: 'Femur Length (FL)' },
    normalRange: {
      pt: '28s: 51–55 · 32s: 59–64 · 36s: 67–72 · 40s: 72–78',
      en: '28w: 51–55 · 32w: 59–64 · 36w: 67–72 · 40w: 72–78',
    },
    unit: 'mm',
    minVal: 49,
    maxVal: 80,
    clinicalNote: {
      pt: 'Avalia crescimento longitudinal ósseo ao longo do 3º trimestre.',
      en: 'Tracks longitudinal skeletal growth across the 3rd trimester.',
    },
  },
  {
    id: 'fet-3-pfe',
    group: 'fetal',
    trimester: 'third',
    category: { pt: '3º Trimestre (28–40s)', en: '3rd Trimester (28–40w)' },
    structure: {
      pt: 'Peso Fetal Estimado (Hadlock · p10–p90)',
      en: 'Estimated Fetal Weight (Hadlock · p10–p90)',
    },
    normalRange: {
      pt: '28s: 950–1.350 · 32s: 1.600–2.250 · 36s: 2.400–3.250 · 40s: 3.000–4.000',
      en: '28w: 950–1,350 · 32w: 1,600–2,250 · 36w: 2,400–3,250 · 40w: 3,000–4,000',
    },
    unit: 'g',
    minVal: 950,
    maxVal: 4000,
    clinicalNote: {
      pt: 'PIG/RCIU: < p10 (atenção especial se < p3). GIG: > p90.',
      en: 'SGA/FGR: < 10th percentile (critical if < 3rd). LGA: > 90th percentile.',
    },
  },
  {
    id: 'fet-3-ila',
    group: 'fetal',
    trimester: 'third',
    category: { pt: '3º Trimestre (Líquido Amniótico)', en: '3rd Trimester (Amniotic Fluid)' },
    structure: {
      pt: 'Índice de Líquido Amniótico (ILA) / MBV',
      en: 'Amniotic Fluid Index (AFI) / SDP',
    },
    normalRange: {
      pt: 'ILA: 5,0 a 24,0 cm · MBV (Maior Bolsão): 2,0 a 8,0 cm',
      en: 'AFI: 5.0 to 24.0 cm · Single Deepest Pocket: 2.0 to 8.0 cm',
    },
    unit: 'cm',
    minVal: 5.0,
    maxVal: 24.0,
    clinicalNote: {
      pt: 'Oligoidrâmnio: ILA < 5 cm ou MBV < 2 cm. Polidrâmnio: ILA > 24–25 cm ou MBV > 8 cm.',
      en: 'Oligohydramnios: AFI < 5 cm or SDP < 2 cm. Polyhydramnios: AFI > 24–25 cm or SDP > 8 cm.',
    },
  },
  {
    id: 'fet-3-doppler',
    group: 'fetal',
    trimester: 'third',
    category: { pt: '3º Trimestre (Doppler)', en: '3rd Trimester (Doppler)' },
    structure: {
      pt: 'Doppler Artéria Umbilical (IP) & ACM',
      en: 'Umbilical Artery (PI) & MCA Doppler',
    },
    normalRange: {
      pt: 'AU IP < 1,2–1,4 (diástole positiva) · ACM IP > 1,0–1,3 · RCP > 1,0',
      en: 'UA PI < 1.2–1.4 (positive end-diastolic flow) · MCA PI > 1.0–1.3 · CPR > 1.0',
    },
    unit: 'IP',
    minVal: 0.5,
    maxVal: 1.35,
    clinicalNote: {
      pt: 'Relação cérebro-placentária (RCP) < 1,0 indica centralização hemodinâmica fetal.',
      en: 'Cerebroplacental ratio (CPR) < 1.0 indicates fetal brain-sparing redistribution.',
    },
  },
];

export const PEDIATRIC_ORGAN_TABLES: PediatricOrganTable[] = [
  {
    id: 'ped-rins',
    organ: { pt: 'Rins (Comprimento Bipolar)', en: 'Kidneys (Bipolar Length)' },
    parameter: { pt: 'Eixo longitudinal renal', en: 'Renal longitudinal length' },
    unit: 'cm',
    generalNote: {
      pt: 'Assimetria normal entre os rins < 1,0 cm. Pelve renal AP normal: < 7 mm em RN/lactentes e < 10 mm em crianças maiores.',
      en: 'Normal side-to-side difference < 1.0 cm. Normal AP renal pelvis: < 7 mm in neonates/infants and < 10 mm in older children.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: '3,8 a 5,0', en: '3.8 to 5.0' }, minVal: 3.8, maxVal: 5.0, note: { pt: 'Prematuros: ~3,2–4,2 cm', en: 'Preterm: ~3.2–4.2 cm' } },
      { ageBand: 'infant1to6m', normalRange: { pt: '4,5 a 6,0', en: '4.5 to 6.0' }, minVal: 4.5, maxVal: 6.0 },
      { ageBand: 'infant6to12m', normalRange: { pt: '5,2 a 6,8', en: '5.2 to 6.8' }, minVal: 5.2, maxVal: 6.8 },
      { ageBand: 'toddler1to3y', normalRange: { pt: '6,0 a 7,6', en: '6.0 to 7.6' }, minVal: 6.0, maxVal: 7.6 },
      { ageBand: 'child4to6y', normalRange: { pt: '7,0 a 8,6', en: '7.0 to 8.6' }, minVal: 7.0, maxVal: 8.6 },
      { ageBand: 'child7to10y', normalRange: { pt: '7,8 a 9,6', en: '7.8 to 9.6' }, minVal: 7.8, maxVal: 9.6 },
      { ageBand: 'preteen11to14y', normalRange: { pt: '8,6 a 10,8', en: '8.6 to 10.8' }, minVal: 8.6, maxVal: 10.8 },
      { ageBand: 'teen15to17y', normalRange: { pt: '9,2 a 11,8', en: '9.2 to 11.8' }, minVal: 9.2, maxVal: 11.8 },
    ],
  },
  {
    id: 'ped-figado',
    organ: { pt: 'Fígado (Lobo Direito - LHC)', en: 'Liver (Right Lobe - MCL)' },
    parameter: { pt: 'Eixo longitudinal na linha hemiclavicular', en: 'Longitudinal span at midclavicular line' },
    unit: 'cm',
    generalNote: {
      pt: 'Medir no plano sagital em decúbito dorsal na linha hemiclavicular direita.',
      en: 'Measure in sagittal plane at the right midclavicular line in supine position.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: '4,5 a 6,5', en: '4.5 to 6.5' }, minVal: 4.5, maxVal: 6.5 },
      { ageBand: 'infant1to6m', normalRange: { pt: '5,5 a 7,8', en: '5.5 to 7.8' }, minVal: 5.5, maxVal: 7.8 },
      { ageBand: 'infant6to12m', normalRange: { pt: '6,5 a 8,8', en: '6.5 to 8.8' }, minVal: 6.5, maxVal: 8.8 },
      { ageBand: 'toddler1to3y', normalRange: { pt: '7,5 a 10,0', en: '7.5 to 10.0' }, minVal: 7.5, maxVal: 10.0 },
      { ageBand: 'child4to6y', normalRange: { pt: '8,5 a 11,2', en: '8.5 to 11.2' }, minVal: 8.5, maxVal: 11.2 },
      { ageBand: 'child7to10y', normalRange: { pt: '9,5 a 12,5', en: '9.5 to 12.5' }, minVal: 9.5, maxVal: 12.5 },
      { ageBand: 'preteen11to14y', normalRange: { pt: '10,5 a 13,8', en: '10.5 to 13.8' }, minVal: 10.5, maxVal: 13.8 },
      { ageBand: 'teen15to17y', normalRange: { pt: '11,0 a 14,8', en: '11.0 to 14.8' }, minVal: 11.0, maxVal: 14.8 },
    ],
  },
  {
    id: 'ped-baco',
    organ: { pt: 'Baço (Eixo Longitudinal)', en: 'Spleen (Longitudinal Span)' },
    parameter: { pt: 'Maior comprimento esplênico', en: 'Maximum splenic length' },
    unit: 'cm',
    generalNote: {
      pt: 'Obtido do polo superior ao inferior no plano intercostal oblíquo esquerdo.',
      en: 'Measured pole-to-pole in the left oblique intercostal coronal view.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: '3,2 a 5,0', en: '3.2 to 5.0' }, minVal: 3.2, maxVal: 5.0 },
      { ageBand: 'infant1to6m', normalRange: { pt: '4,0 a 6,0', en: '4.0 to 6.0' }, minVal: 4.0, maxVal: 6.0 },
      { ageBand: 'infant6to12m', normalRange: { pt: '4,8 a 6,8', en: '4.8 to 6.8' }, minVal: 4.8, maxVal: 6.8 },
      { ageBand: 'toddler1to3y', normalRange: { pt: '5,5 a 7,8', en: '5.5 to 7.8' }, minVal: 5.5, maxVal: 7.8 },
      { ageBand: 'child4to6y', normalRange: { pt: '6,5 a 9,0', en: '6.5 to 9.0' }, minVal: 6.5, maxVal: 9.0 },
      { ageBand: 'child7to10y', normalRange: { pt: '7,2 a 10,2', en: '7.2 to 10.2' }, minVal: 7.2, maxVal: 10.2 },
      { ageBand: 'preteen11to14y', normalRange: { pt: '8,0 a 11,2', en: '8.0 to 11.2' }, minVal: 8.0, maxVal: 11.2 },
      { ageBand: 'teen15to17y', normalRange: { pt: '8,5 a 12,2', en: '8.5 to 12.2' }, minVal: 8.5, maxVal: 12.2 },
    ],
  },
  {
    id: 'ped-vesicula',
    organ: { pt: 'Vesícula & Colédoco', en: 'Gallbladder & Common Bile Duct' },
    parameter: { pt: 'Colédoco (mm) · Parede < 3 mm', en: 'CBD (mm) · Wall < 3 mm' },
    unit: 'mm',
    generalNote: {
      pt: 'Parede da vesícula biliar normal ≤ 3,0 mm em jejum. Valores acima indicam dilatação biliar para a faixa etária.',
      en: 'Normal fasting gallbladder wall ≤ 3.0 mm. Values above threshold suggest biliary ductal dilation.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: 'Colédoco ≤ 1,2 · Vesícula 15–30 mm', en: 'CBD ≤ 1.2 · GB 15–30 mm' }, minVal: 0.3, maxVal: 1.2 },
      { ageBand: 'infant1to6m', normalRange: { pt: 'Colédoco ≤ 1,5 · Vesícula 20–35 mm', en: 'CBD ≤ 1.5 · GB 20–35 mm' }, minVal: 0.5, maxVal: 1.5 },
      { ageBand: 'infant6to12m', normalRange: { pt: 'Colédoco ≤ 2,0 · Vesícula 25–40 mm', en: 'CBD ≤ 2.0 · GB 25–40 mm' }, minVal: 0.5, maxVal: 2.0 },
      { ageBand: 'toddler1to3y', normalRange: { pt: 'Colédoco ≤ 2,5 · Vesícula 30–50 mm', en: 'CBD ≤ 2.5 · GB 30–50 mm' }, minVal: 0.8, maxVal: 2.5 },
      { ageBand: 'child4to6y', normalRange: { pt: 'Colédoco ≤ 3,0 · Vesícula 35–60 mm', en: 'CBD ≤ 3.0 · GB 35–60 mm' }, minVal: 1.0, maxVal: 3.0 },
      { ageBand: 'child7to10y', normalRange: { pt: 'Colédoco ≤ 3,5 · Vesícula 40–70 mm', en: 'CBD ≤ 3.5 · GB 40–70 mm' }, minVal: 1.0, maxVal: 3.5 },
      { ageBand: 'preteen11to14y', normalRange: { pt: 'Colédoco ≤ 4,5 · Vesícula 45–80 mm', en: 'CBD ≤ 4.5 · GB 45–80 mm' }, minVal: 1.5, maxVal: 4.5 },
      { ageBand: 'teen15to17y', normalRange: { pt: 'Colédoco ≤ 5,0 · Vesícula 50–85 mm', en: 'CBD ≤ 5.0 · GB 50–85 mm' }, minVal: 1.5, maxVal: 5.0 },
    ],
  },
  {
    id: 'ped-pancreas',
    organ: { pt: 'Pâncreas', en: 'Pancreas' },
    parameter: { pt: 'Cabeça / Corpo / Cauda (AP em mm)', en: 'Head / Body / Tail (AP in mm)' },
    unit: 'mm',
    generalNote: {
      pt: 'Na infância o pâncreas pode ser discretamente hipo/isoecogênico ou levemente mais ecogênico que o fígado. Wirsung ≤ 1,5–2,0 mm.',
      en: 'In children, normal pancreatic parenchyma can appear slightly echogenic relative to liver. Main duct ≤ 1.5–2.0 mm.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: 'Cab 8–14 · Corpo 5–9 · Cauda 7–13', en: 'Head 8–14 · Body 5–9 · Tail 7–13' }, minVal: 5, maxVal: 14 },
      { ageBand: 'infant1to6m', normalRange: { pt: 'Cab 9–16 · Corpo 6–10 · Cauda 8–14', en: 'Head 9–16 · Body 6–10 · Tail 8–14' }, minVal: 6, maxVal: 16 },
      { ageBand: 'infant6to12m', normalRange: { pt: 'Cab 10–17 · Corpo 6–11 · Cauda 9–15', en: 'Head 10–17 · Body 6–11 · Tail 9–15' }, minVal: 6, maxVal: 17 },
      { ageBand: 'toddler1to3y', normalRange: { pt: 'Cab 12–19 · Corpo 7–12 · Cauda 10–17', en: 'Head 12–19 · Body 7–12 · Tail 10–17' }, minVal: 7, maxVal: 19 },
      { ageBand: 'child4to6y', normalRange: { pt: 'Cab 14–21 · Corpo 8–13 · Cauda 12–19', en: 'Head 14–21 · Body 8–13 · Tail 12–19' }, minVal: 8, maxVal: 21 },
      { ageBand: 'child7to10y', normalRange: { pt: 'Cab 15–23 · Corpo 9–15 · Cauda 13–21', en: 'Head 15–23 · Body 9–15 · Tail 13–21' }, minVal: 9, maxVal: 23 },
      { ageBand: 'preteen11to14y', normalRange: { pt: 'Cab 17–25 · Corpo 10–17 · Cauda 15–23', en: 'Head 17–25 · Body 10–17 · Tail 15–23' }, minVal: 10, maxVal: 25 },
      { ageBand: 'teen15to17y', normalRange: { pt: 'Cab 18–27 · Corpo 11–18 · Cauda 16–25', en: 'Head 18–27 · Body 11–18 · Tail 16–25' }, minVal: 11, maxVal: 27 },
    ],
  },
  {
    id: 'ped-tireoide',
    organ: { pt: 'Tireoide', en: 'Thyroid' },
    parameter: { pt: 'Volume total (mL) & AP do lobo (mm)', en: 'Total volume (mL) & lobe AP (mm)' },
    unit: 'mL / mm',
    generalNote: {
      pt: 'Volume de cada lobo = C × L × AP × 0,52. Ecotextura homogênea sem linfonodomegalias suspeitas.',
      en: 'Lobe volume = L × W × AP × 0.52. Homogeneous echotexture expected.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: 'Vol: 0,4–1,4 mL · AP: 5–8 mm', en: 'Vol: 0.4–1.4 mL · AP: 5–8 mm' } },
      { ageBand: 'infant1to6m', normalRange: { pt: 'Vol: 0,8–1,8 mL · AP: 6–9 mm', en: 'Vol: 0.8–1.8 mL · AP: 6–9 mm' } },
      { ageBand: 'infant6to12m', normalRange: { pt: 'Vol: 1,0–2,2 mL · AP: 7–10 mm', en: 'Vol: 1.0–2.2 mL · AP: 7–10 mm' } },
      { ageBand: 'toddler1to3y', normalRange: { pt: 'Vol: 1,4–3,2 mL · AP: 8–11 mm', en: 'Vol: 1.4–3.2 mL · AP: 8–11 mm' } },
      { ageBand: 'child4to6y', normalRange: { pt: 'Vol: 2,0–4,5 mL · AP: 9–12 mm', en: 'Vol: 2.0–4.5 mL · AP: 9–12 mm' } },
      { ageBand: 'child7to10y', normalRange: { pt: 'Vol: 3,0–6,5 mL · AP: 10–14 mm', en: 'Vol: 3.0–6.5 mL · AP: 10–14 mm' } },
      { ageBand: 'preteen11to14y', normalRange: { pt: 'Vol: 4,5–10,5 mL · AP: 11–16 mm', en: 'Vol: 4.5–10.5 mL · AP: 11–16 mm' } },
      { ageBand: 'teen15to17y', normalRange: { pt: 'Vol: 6,0–14,5 mL · AP: 12–17 mm', en: 'Vol: 6.0–14.5 mL · AP: 12–17 mm' } },
    ],
  },
  {
    id: 'ped-bexiga',
    organ: { pt: 'Bexiga & Capacidade Vesical', en: 'Urinary Bladder & Capacity' },
    parameter: { pt: 'Capacidade esperada (mL) · Parede ≤ 3 mm', en: 'Expected capacity (mL) · Wall ≤ 3 mm' },
    unit: 'mL / mm',
    generalNote: {
      pt: 'Fórmula prática (> 1 ano): Capacidade (mL) ≈ (idade + 2) × 30. Parede cheia ≤ 3 mm.',
      en: 'Practical formula (> 1 yr): Expected capacity (mL) ≈ (age + 2) × 30. Distended wall ≤ 3 mm.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: 'Cap: 20–40 mL · Parede ≤ 3 mm', en: 'Cap: 20–40 mL · Wall ≤ 3 mm' } },
      { ageBand: 'infant1to6m', normalRange: { pt: 'Cap: 35–65 mL · Parede ≤ 3 mm', en: 'Cap: 35–65 mL · Wall ≤ 3 mm' } },
      { ageBand: 'infant6to12m', normalRange: { pt: 'Cap: 60–90 mL · Parede ≤ 3 mm', en: 'Cap: 60–90 mL · Wall ≤ 3 mm' } },
      { ageBand: 'toddler1to3y', normalRange: { pt: 'Cap: 90–150 mL · Parede ≤ 3 mm', en: 'Cap: 90–150 mL · Wall ≤ 3 mm' } },
      { ageBand: 'child4to6y', normalRange: { pt: 'Cap: 180–240 mL · Parede ≤ 3 mm', en: 'Cap: 180–240 mL · Wall ≤ 3 mm' } },
      { ageBand: 'child7to10y', normalRange: { pt: 'Cap: 270–360 mL · Parede ≤ 3 mm', en: 'Cap: 270–360 mL · Wall ≤ 3 mm' } },
      { ageBand: 'preteen11to14y', normalRange: { pt: 'Cap: 390–480 mL · Parede ≤ 3 mm', en: 'Cap: 390–480 mL · Wall ≤ 3 mm' } },
      { ageBand: 'teen15to17y', normalRange: { pt: 'Cap: 450–550 mL · Parede ≤ 3 mm', en: 'Cap: 450–550 mL · Wall ≤ 3 mm' } },
    ],
  },
  {
    id: 'ped-tgi',
    organ: { pt: 'Tubo Digestivo (Piloro & Apêndice)', en: 'GI Tract (Pylorus & Appendix)' },
    parameter: { pt: 'Músculo pilórico & diâmetro apendicular (mm)', en: 'Pyloric muscle & appendiceal diameter (mm)' },
    unit: 'mm',
    generalNote: {
      pt: 'Estenose hipertrófica do piloro: músculo ≥ 3,0 mm e canal ≥ 15–17 mm. Apendicite: diâmetro ≥ 6,0 mm não compressível.',
      en: 'Hypertrophic pyloric stenosis: muscle ≥ 3.0 mm & length ≥ 15–17 mm. Appendicitis: non-compressible ≥ 6.0 mm.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: 'Piloro < 3,0 mm (comp < 15 mm) · Apêndice < 5,5 mm', en: 'Pylorus < 3.0 mm (len < 15 mm) · Appendix < 5.5 mm' }, minVal: 1.0, maxVal: 2.9 },
      { ageBand: 'infant1to6m', normalRange: { pt: 'Piloro < 3,0 mm (comp < 15 mm) · Apêndice < 5,5 mm', en: 'Pylorus < 3.0 mm (len < 15 mm) · Appendix < 5.5 mm' }, minVal: 1.0, maxVal: 2.9 },
      { ageBand: 'infant6to12m', normalRange: { pt: 'Apêndice < 6,0 mm (compressível)', en: 'Appendix < 6.0 mm (compressible)' }, minVal: 2.0, maxVal: 5.9 },
      { ageBand: 'toddler1to3y', normalRange: { pt: 'Apêndice < 6,0 mm (parede < 2 mm)', en: 'Appendix < 6.0 mm (wall < 2 mm)' }, minVal: 2.0, maxVal: 5.9 },
      { ageBand: 'child4to6y', normalRange: { pt: 'Apêndice < 6,0 mm (parede < 2 mm)', en: 'Appendix < 6.0 mm (wall < 2 mm)' }, minVal: 2.0, maxVal: 5.9 },
      { ageBand: 'child7to10y', normalRange: { pt: 'Apêndice < 6,0 mm (parede < 2 mm)', en: 'Appendix < 6.0 mm (wall < 2 mm)' }, minVal: 2.0, maxVal: 5.9 },
      { ageBand: 'preteen11to14y', normalRange: { pt: 'Apêndice < 6,0 mm (parede < 2 mm)', en: 'Appendix < 6.0 mm (wall < 2 mm)' }, minVal: 2.0, maxVal: 5.9 },
      { ageBand: 'teen15to17y', normalRange: { pt: 'Apêndice < 6,0 mm (parede < 2 mm)', en: 'Appendix < 6.0 mm (wall < 2 mm)' }, minVal: 2.0, maxVal: 5.9 },
    ],
  },
  {
    id: 'ped-pelve',
    organ: { pt: 'Útero & Ovários (Pediátrico)', en: 'Uterus & Ovaries (Pediatric)' },
    parameter: { pt: 'Comprimento uterino (cm) & volume ovariano (cm³)', en: 'Uterine length (cm) & ovarian volume (cm³)' },
    unit: 'cm / cm³',
    generalNote: {
      pt: 'No RN há estímulo hormonal materno transitório (útero maior). Na fase pré-púbere o colo predomina sobre o corpo (2:1).',
      en: 'Neonates show transient maternal estrogen stimulation. Prepubertal cervix is larger than fundus (2:1).',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: 'Útero 3,0–4,2 cm · Ovários 0,5–1,5 cm³', en: 'Uterus 3.0–4.2 cm · Ovaries 0.5–1.5 cm³' } },
      { ageBand: 'infant1to6m', normalRange: { pt: 'Útero 2,0–3,0 cm · Ovários 0,3–1,0 cm³', en: 'Uterus 2.0–3.0 cm · Ovaries 0.3–1.0 cm³' } },
      { ageBand: 'infant6to12m', normalRange: { pt: 'Útero 2,0–3,0 cm · Ovários 0,3–1,0 cm³', en: 'Uterus 2.0–3.0 cm · Ovaries 0.3–1.0 cm³' } },
      { ageBand: 'toddler1to3y', normalRange: { pt: 'Útero 2,2–3,3 cm · Ovários 0,4–1,2 cm³', en: 'Uterus 2.2–3.3 cm · Ovaries 0.4–1.2 cm³' } },
      { ageBand: 'child4to6y', normalRange: { pt: 'Útero 2,5–3,6 cm · Ovários 0,6–1,5 cm³', en: 'Uterus 2.5–3.6 cm · Ovaries 0.6–1.5 cm³' } },
      { ageBand: 'child7to10y', normalRange: { pt: 'Útero 2,8–4,2 cm · Ovários 0,8–2,5 cm³', en: 'Uterus 2.8–4.2 cm · Ovaries 0.8–2.5 cm³' } },
      { ageBand: 'preteen11to14y', normalRange: { pt: 'Útero 4,0–7,0 cm · Ovários 2,0–6,5 cm³', en: 'Uterus 4.0–7.0 cm · Ovaries 2.0–6.5 cm³' } },
      { ageBand: 'teen15to17y', normalRange: { pt: 'Útero 5,5–8,5 cm · Ovários 3,0–9,5 cm³', en: 'Uterus 5.5–8.5 cm · Ovaries 3.0–9.5 cm³' } },
    ],
  },
  {
    id: 'ped-transfontanela',
    organ: { pt: 'Transfontanela (Cérebro)', en: 'Cranial (Transfontanellar)' },
    parameter: { pt: 'Corno frontal ventrículo lateral & IR ACA', en: 'Frontal horn width & ACA RI' },
    unit: 'mm',
    generalNote: {
      pt: 'Janela acessível via fontanela anterior enquanto patente (~12–18 meses). IR da artéria cerebral anterior: 0,60–0,85 após 72h.',
      en: 'Assessed via patent anterior fontanelle (~12–18 mo). Anterior cerebral artery RI: 0.60–0.85 after 72h.',
    },
    rows: [
      { ageBand: 'newborn', normalRange: { pt: 'Corno frontal < 3 mm · Sinocortical < 4 mm · IR 0,60–0,85', en: 'Frontal horn < 3 mm · Sinocortical < 4 mm · RI 0.60–0.85' }, minVal: 0.5, maxVal: 3.0 },
      { ageBand: 'infant1to6m', normalRange: { pt: 'Corno frontal < 3–4 mm · Subaracnóideo < 4–5 mm', en: 'Frontal horn < 3–4 mm · Subarachnoid < 4–5 mm' }, minVal: 0.5, maxVal: 4.0 },
      { ageBand: 'infant6to12m', normalRange: { pt: 'Corno frontal < 4 mm · Fontanela em fechamento', en: 'Frontal horn < 4 mm · Closing fontanelle' }, minVal: 0.5, maxVal: 4.0 },
      { ageBand: 'toddler1to3y', normalRange: { pt: 'Fontanela habitualmente fechada (> 12–18m)', en: 'Fontanelle typically closed (> 12–18m)' } },
      { ageBand: 'child4to6y', normalRange: { pt: 'Não aplicável (fontanela fechada)', en: 'N/A (closed fontanelle)' } },
      { ageBand: 'child7to10y', normalRange: { pt: 'Não aplicável (fontanela fechada)', en: 'N/A (closed fontanelle)' } },
      { ageBand: 'preteen11to14y', normalRange: { pt: 'Não aplicável (fontanela fechada)', en: 'N/A (closed fontanelle)' } },
      { ageBand: 'teen15to17y', normalRange: { pt: 'Não aplicável (fontanela fechada)', en: 'N/A (closed fontanelle)' } },
    ],
  },
];

export const ADULT_MEASUREMENTS: ReferenceMeasurement[] = [
  {
    id: 'adu-figado-lhd',
    group: 'adult',
    category: { pt: 'Fígado', en: 'Liver' },
    structure: {
      pt: 'Lobo Hepático Direito (Linha Hemiclavicular)',
      en: 'Right Hepatic Lobe (Midclavicular Line)',
    },
    normalRange: { pt: '≤ 15,0 a 15,5', en: '≤ 15.0 to 15.5' },
    unit: 'cm',
    minVal: 10.0,
    maxVal: 15.5,
    clinicalNote: {
      pt: 'Medidas > 16,0 cm sugerem hepatomegalia. Lobo esquerdo AP normal ≤ 6,0–7,0 cm.',
      en: 'Measurements > 16.0 cm indicate hepatomegaly. Normal left lobe AP ≤ 6.0–7.0 cm.',
    },
  },
  {
    id: 'adu-figado-porta',
    group: 'adult',
    category: { pt: 'Fígado', en: 'Liver' },
    structure: { pt: 'Veia Porta (Calibre Hilar)', en: 'Main Portal Vein Diameter' },
    normalRange: { pt: '≤ 12,0 a 13,0 (fluxo 15–30 cm/s)', en: '≤ 12.0 to 13.0 (flow 15–30 cm/s)' },
    unit: 'mm',
    minVal: 6.0,
    maxVal: 13.0,
    clinicalNote: {
      pt: 'Calibre > 13 mm ou ausência de variação respiratória sugere hipertensão portal.',
      en: 'Diameter > 13 mm or loss of respiratory phasicity suggests portal hypertension.',
    },
  },
  {
    id: 'adu-vesicula-parede',
    group: 'adult',
    category: { pt: 'Vesícula e Vias Biliares', en: 'Gallbladder & Biliary Tract' },
    structure: { pt: 'Parede da Vesícula Biliar', en: 'Gallbladder Wall Thickness' },
    normalRange: { pt: '≤ 3,0', en: '≤ 3.0' },
    unit: 'mm',
    minVal: 1.0,
    maxVal: 3.0,
    clinicalNote: {
      pt: 'Medir na parede anterior em jejum. Eixo longitudinal ≤ 10 cm e transverso ≤ 4 cm.',
      en: 'Measure anterior wall while fasting. Normal length ≤ 10 cm, width ≤ 4 cm.',
    },
  },
  {
    id: 'adu-coledoco',
    group: 'adult',
    category: { pt: 'Vesícula e Vias Biliares', en: 'Gallbladder & Biliary Tract' },
    structure: { pt: 'Colédoco (Via Biliar Principal)', en: 'Common Bile Duct (CBD)' },
    normalRange: {
      pt: '≤ 6,0 (até 8–10 mm em idosos ou pós-colecistectomia)',
      en: '≤ 6.0 (up to 8–10 mm in elderly or post-cholecystectomy)',
    },
    unit: 'mm',
    minVal: 2.0,
    maxVal: 6.0,
    clinicalNote: {
      pt: 'Regra prática: +1 mm por década acima dos 60 anos. Vias intra-hepáticas normais ≤ 2 mm.',
      en: 'Rule of thumb: +1 mm per decade over age 60. Normal intrahepatic ducts ≤ 2 mm.',
    },
  },
  {
    id: 'adu-baco',
    group: 'adult',
    category: { pt: 'Baço', en: 'Spleen' },
    structure: { pt: 'Comprimento Longitudinal Esplênico', en: 'Splenic Longitudinal Length' },
    normalRange: { pt: '8,0 a 12,5 (espessura hilar ≤ 5,0 cm)', en: '8.0 to 12.5 (hilar thickness ≤ 5.0 cm)' },
    unit: 'cm',
    minVal: 8.0,
    maxVal: 12.5,
    clinicalNote: {
      pt: 'Esplenomegalia franca > 13,0 cm; índice esplênico normal < 480.',
      en: 'Frank splenomegaly > 13.0 cm; normal splenic index < 480.',
    },
  },
  {
    id: 'adu-pancreas',
    group: 'adult',
    category: { pt: 'Pâncreas', en: 'Pancreas' },
    structure: { pt: 'Cabeça / Corpo / Cauda & Wirsung', en: 'Head / Body / Tail & Main Duct' },
    normalRange: {
      pt: 'Cabeça ≤ 30 · Corpo ≤ 22 · Cauda ≤ 28 · Wirsung ≤ 2–3',
      en: 'Head ≤ 30 · Body ≤ 22 · Tail ≤ 28 · Duct ≤ 2–3',
    },
    unit: 'mm',
    minVal: 10,
    maxVal: 30,
    clinicalNote: {
      pt: 'A ecogenicidade pancreática aumenta fisiologicamente com idade e IMC.',
      en: 'Pancreatic echogenicity physiologically increases with age and BMI.',
    },
  },
  {
    id: 'adu-rim',
    group: 'adult',
    category: { pt: 'Rins e Vias Urinárias', en: 'Kidneys & Urinary Tract' },
    structure: { pt: 'Comprimento Renal Bipolar', en: 'Bipolar Renal Length' },
    normalRange: { pt: '9,0 a 12,5', en: '9.0 to 12.5' },
    unit: 'cm',
    minVal: 9.0,
    maxVal: 12.5,
    clinicalNote: {
      pt: 'Espessura parenquimatosa 14–20 mm; córtex 7–11 mm; assimetria normal < 1,5 cm.',
      en: 'Parenchymal thickness 14–20 mm; cortex 7–11 mm; normal side difference < 1.5 cm.',
    },
  },
  {
    id: 'adu-pelve-renal',
    group: 'adult',
    category: { pt: 'Rins e Vias Urinárias', en: 'Kidneys & Urinary Tract' },
    structure: { pt: 'Pelve Renal (Diâmetro AP)', en: 'Renal Pelvis (AP Diameter)' },
    normalRange: { pt: '< 10,0', en: '< 10.0' },
    unit: 'mm',
    minVal: 0,
    maxVal: 9.9,
    clinicalNote: {
      pt: 'Reavaliar pós-micção se houver ectasia leve com bexiga hiperdistendida.',
      en: 'Reassess post-void if mild dilation is seen with an overdistended bladder.',
    },
  },
  {
    id: 'adu-bexiga',
    group: 'adult',
    category: { pt: 'Bexiga e Próstata', en: 'Bladder & Prostate' },
    structure: { pt: 'Parede Vesical & Resíduo Pós-Miccional', en: 'Bladder Wall & Post-Void Residual' },
    normalRange: {
      pt: 'Parede cheia ≤ 3,0 mm · Vazia ≤ 5,0 mm · Resíduo < 50 mL',
      en: 'Full wall ≤ 3.0 mm · Empty ≤ 5.0 mm · PVR < 50 mL',
    },
    unit: 'mm / mL',
    minVal: 1.0,
    maxVal: 3.0,
    clinicalNote: {
      pt: 'Resíduo pós-miccional > 50–100 mL deve ser correlacionado com sintomas urinários.',
      en: 'Post-void residual > 50–100 mL should be correlated with voiding symptoms.',
    },
  },
  {
    id: 'adu-prostata',
    group: 'adult',
    category: { pt: 'Bexiga e Próstata', en: 'Bladder & Prostate' },
    structure: { pt: 'Próstata (Volume Estimado)', en: 'Prostate (Estimated Volume)' },
    normalRange: { pt: '≤ 25 a 30 (~40 × 30 × 25 mm)', en: '≤ 25 to 30 (~40 × 30 × 25 mm)' },
    unit: 'cm³ / g',
    minVal: 12,
    maxVal: 30,
    clinicalNote: {
      pt: 'HPB leve: 30–50 cm³ | moderada: 50–80 cm³ | acentuada: > 80 cm³.',
      en: 'Mild BPH: 30–50 cm³ | moderate: 50–80 cm³ | marked: > 80 cm³.',
    },
  },
  {
    id: 'adu-tireoide',
    group: 'adult',
    category: { pt: 'Tireoide', en: 'Thyroid' },
    structure: { pt: 'Lobos, Istmo e Volume Total', en: 'Lobes, Isthmus & Total Volume' },
    normalRange: {
      pt: 'Vol: 6 a 18 mL · Lobo: 40–60 × 13–18 mm · Istmo ≤ 4–5 mm',
      en: 'Vol: 6 to 18 mL · Lobe: 40–60 × 13–18 mm · Isthmus ≤ 4–5 mm',
    },
    unit: 'mL / mm',
    minVal: 6.0,
    maxVal: 18.0,
    clinicalNote: {
      pt: 'Bócio se volume total > 18 mL (mulher) ou > 20–25 mL (homem). Classificar nódulos via ACR TI-RADS.',
      en: 'Goiter if total volume > 18 mL (women) or > 20–25 mL (men). Score nodules via ACR TI-RADS.',
    },
  },
  {
    id: 'adu-utero',
    group: 'adult',
    category: { pt: 'Útero e Ovários', en: 'Uterus & Ovaries' },
    structure: { pt: 'Útero (Comprimento e Volume)', en: 'Uterus (Length & Volume)' },
    normalRange: {
      pt: 'Menacme: 6–9 cm (30–90 cm³) · Pós-menopausa: 3,5–6,0 cm',
      en: 'Premenopausal: 6–9 cm (30–90 cm³) · Postmenopausal: 3.5–6.0 cm',
    },
    unit: 'cm / cm³',
    minVal: 6.0,
    maxVal: 9.0,
    clinicalNote: {
      pt: 'Multíparas podem apresentar volume uterino fisiológico de até 110–120 cm³.',
      en: 'Multiparous women may have physiological uterine volumes up to 110–120 cm³.',
    },
  },
  {
    id: 'adu-endometrio',
    group: 'adult',
    category: { pt: 'Útero e Ovários', en: 'Uterus & Ovaries' },
    structure: { pt: 'Eco Endometrial (Espessura)', en: 'Endometrial Stripe Thickness' },
    normalRange: {
      pt: 'Proliferativa: 4–8 · Secretora: 8–14 · Pós-menopausa sem TRH: ≤ 4–5',
      en: 'Proliferative: 4–8 · Secretory: 8–14 · Postmenopausal (no HRT): ≤ 4–5',
    },
    unit: 'mm',
    minVal: 2.0,
    maxVal: 14.0,
    clinicalNote: {
      pt: 'Na pós-menopausa com sangramento e espessura > 4–5 mm, indica investigação endometrial.',
      en: 'Postmenopausal bleeding with thickness > 4–5 mm warrants endometrial evaluation.',
    },
  },
  {
    id: 'adu-ovarios',
    group: 'adult',
    category: { pt: 'Útero e Ovários', en: 'Uterus & Ovaries' },
    structure: { pt: 'Ovários (Volume)', en: 'Ovarian Volume' },
    normalRange: {
      pt: 'Menacme: 3,0 a 10,0 cm³ · Pós-menopausa: < 3,0 cm³',
      en: 'Premenopausal: 3.0 to 10.0 cm³ · Postmenopausal: < 3.0 cm³',
    },
    unit: 'cm³',
    minVal: 3.0,
    maxVal: 10.0,
    clinicalNote: {
      pt: 'Folículos dominantes fisiológicos podem atingir 18–25 mm no período pré-ovulatório.',
      en: 'Physiological dominant follicles may reach 18–25 mm prior to ovulation.',
    },
  },
  {
    id: 'adu-aorta',
    group: 'adult',
    category: { pt: 'Aorta e Vascular', en: 'Aorta & Vascular' },
    structure: {
      pt: 'Aorta Abdominal Infrarrenal (Diâmetro AP)',
      en: 'Infrarenal Abdominal Aorta (AP Diameter)',
    },
    normalRange: {
      pt: '< 2,5 (ectasia: 2,5–2,9 cm · aneurisma: ≥ 3,0 cm)',
      en: '< 2.5 (ectasia: 2.5–2.9 cm · aneurysm: ≥ 3.0 cm)',
    },
    unit: 'cm',
    minVal: 1.4,
    maxVal: 2.4,
    clinicalNote: {
      pt: 'Medir de parede externa a parede externa. VCI normal ≤ 2,0–2,5 cm com colabamento inspiratório > 50%.',
      en: 'Measure outer-to-outer wall. Normal IVC ≤ 2.0–2.5 cm with > 50% inspiratory collapse.',
    },
  },
  {
    id: 'adu-carotida',
    group: 'adult',
    category: { pt: 'Aorta e Vascular', en: 'Aorta & Vascular' },
    structure: {
      pt: 'Artéria Carótida Interna (PSV / EMI)',
      en: 'Internal Carotid Artery (PSV / IMT)',
    },
    normalRange: {
      pt: 'PSV < 125 cm/s · Espessura Médio-Intimal (EMI) < 0,9 mm',
      en: 'PSV < 125 cm/s · Intima-Media Thickness (IMT) < 0.9 mm',
    },
    unit: 'cm/s',
    minVal: 40,
    maxVal: 124,
    clinicalNote: {
      pt: 'Critérios SRU: PSV 125–230 cm/s sugere estenose 50–69%; > 230 cm/s sugere ≥ 70%.',
      en: 'SRU consensus: PSV 125–230 cm/s suggests 50–69% stenosis; > 230 cm/s suggests ≥ 70%.',
    },
  },
];
