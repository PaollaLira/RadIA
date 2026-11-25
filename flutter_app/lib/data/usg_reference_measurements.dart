enum ReferenceGroup { fetal, pediatric, adult }

enum FetalTrimester { first, second, third }

enum PediatricAgeBand {
  newborn('RN (0–28d)'),
  infant1to6m('1–6 meses'),
  infant6to12m('6–12 meses'),
  toddler1to3y('1–3 anos'),
  child4to6y('4–6 anos'),
  child7to10y('7–10 anos'),
  preteen11to14y('11–14 anos'),
  teen15to17y('15–17 anos');

  const PediatricAgeBand(this.label);
  final String label;
}

class ReferenceMeasurement {
  final String id;
  final ReferenceGroup group;
  final String category; // Órgão ou Trimestre
  final String structure;
  final String normalRange;
  final String unit;
  final double? minVal;
  final double? maxVal;
  final String? clinicalNote;
  final FetalTrimester? trimester;
  final PediatricAgeBand? pediatricAgeBand;

  const ReferenceMeasurement({
    required this.id,
    required this.group,
    required this.category,
    required this.structure,
    required this.normalRange,
    required this.unit,
    this.minVal,
    this.maxVal,
    this.clinicalNote,
    this.trimester,
    this.pediatricAgeBand,
  });
}

class PediatricOrganRow {
  final PediatricAgeBand ageBand;
  final String normalRange;
  final double? minVal;
  final double? maxVal;
  final String? note;

  const PediatricOrganRow({
    required this.ageBand,
    required this.normalRange,
    this.minVal,
    this.maxVal,
    this.note,
  });
}

class PediatricOrganTable {
  final String organ;
  final String parameter;
  final String unit;
  final String generalNote;
  final List<PediatricOrganRow> rows;

  const PediatricOrganTable({
    required this.organ,
    required this.parameter,
    required this.unit,
    required this.generalNote,
    required this.rows,
  });
}

class UsgReferenceData {
  static const List<ReferenceMeasurement> fetalMeasurements = [
    // ================= 1º TRIMESTRE =================
    ReferenceMeasurement(
      id: 'fet-1-sg',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.first,
      category: '1º Trimestre (4–13s6d)',
      structure: 'Saco Gestacional (Diâmetro Médio - DMS)',
      normalRange: '4,5 sem: 2–3 mm · 6 sem: 10–15 mm · 8 sem: 24–28 mm',
      unit: 'mm',
      clinicalNote:
          'Crescimento esperado ~1,0–1,2 mm/dia. Vesícula vitelínica deve estar visível com DMS ≥ 8–10 mm e embrião com DMS ≥ 25 mm.',
    ),
    ReferenceMeasurement(
      id: 'fet-1-vv',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.first,
      category: '1º Trimestre (4–13s6d)',
      structure: 'Vesícula Vitelínica (VV)',
      normalRange: '2,0 a 6,0',
      unit: 'mm',
      minVal: 2.0,
      maxVal: 6.0,
      clinicalNote:
          'Visível a partir de ~5,5 semanas. Diâmetro > 6,0–7,0 mm ou forma irregular associa-se a maior risco de perda gestacional.',
    ),
    ReferenceMeasurement(
      id: 'fet-1-ccn',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.first,
      category: '1º Trimestre (4–13s6d)',
      structure: 'Comprimento Cabeça-Nádega (CCN / CRL)',
      normalRange: '6s: 4–6 · 8s: 15–17 · 10s: 31–33 · 12s: 52–56 · 13s6d: 75–84',
      unit: 'mm',
      minVal: 2.0,
      maxVal: 84.0,
      clinicalNote:
          'Método mais preciso para datação da idade gestacional no 1º trimestre (erro ± 3–5 dias).',
    ),
    ReferenceMeasurement(
      id: 'fet-1-fcf',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.first,
      category: '1º Trimestre (4–13s6d)',
      structure: 'Frequência Cardíaca Fetal (FCF)',
      normalRange: '6s: 90–115 · 7–8s: 120–160 · 9–13s: 140–170',
      unit: 'bpm',
      minVal: 110.0,
      maxVal: 175.0,
      clinicalNote:
          'Embrião ≥ 7 mm sem BCF sugere gestação anembrionada/óbito embrionário precoce (critério SRU).',
    ),
    ReferenceMeasurement(
      id: 'fet-1-tn',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.first,
      category: '1º Trimestre (4–13s6d)',
      structure: 'Translucência Nucal (TN — 11s a 13s6d)',
      normalRange: '< 2,5 (p95 varia ~2,1 a 2,8 conforme CCN 45–84 mm)',
      unit: 'mm',
      minVal: 0.5,
      maxVal: 2.5,
      clinicalNote:
          'Medir em corte sagital estrito com feto em posição neutra, distinguindo pele fetal do âmnio (critérios FMF). TN ≥ 3,5 mm requer investigação detalhada.',
    ),

    // ================= 2º TRIMESTRE =================
    ReferenceMeasurement(
      id: 'fet-2-dbp',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (14–27s6d)',
      structure: 'Diâmetro Biparietal (DBP)',
      normalRange: '16s: 32–36 · 20s: 45–49 · 24s: 58–62 · 27s: 66–71',
      unit: 'mm',
      minVal: 25.0,
      maxVal: 72.0,
      clinicalNote:
          'Corte transtalâmico incluindo tálamos, cavum do septo pelúcido e foice cerebral; medição externo-interno ou externo-externo conforme tabela.',
    ),
    ReferenceMeasurement(
      id: 'fet-2-cc',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (14–27s6d)',
      structure: 'Circunferência Cefálica (CC / HC)',
      normalRange: '16s: 118–132 · 20s: 168–182 · 24s: 212–228 · 27s: 243–260',
      unit: 'mm',
      minVal: 95.0,
      maxVal: 265.0,
      clinicalNote:
          'Menos influenciada por dolicocefalia ou braquicefalia que o DBP isolado.',
    ),
    ReferenceMeasurement(
      id: 'fet-2-ca',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (14–27s6d)',
      structure: 'Circunferência Abdominal (CA / AC)',
      normalRange: '16s: 98–112 · 20s: 142–158 · 24s: 185–205 · 27s: 218–240',
      unit: 'mm',
      minVal: 80.0,
      maxVal: 245.0,
      clinicalNote:
          'Corte circular com estômago, porção umbilical da veia porta esquerda ("J") e 1 arco costal completo de cada lado.',
    ),
    ReferenceMeasurement(
      id: 'fet-2-cf',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (14–27s6d)',
      structure: 'Comprimento do Fêmur (CF / FL)',
      normalRange: '16s: 19–23 · 20s: 31–35 · 24s: 41–46 · 27s: 49–53',
      unit: 'mm',
      minVal: 14.0,
      maxVal: 54.0,
      clinicalNote:
          'Medir apenas a diáfise ossificada, perpendicular ao feixe sonoro (ângulo < 30°).',
    ),
    ReferenceMeasurement(
      id: 'fet-2-ventriculo',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (14–27s6d)',
      structure: 'Átrio do Ventrículo Lateral Cerebral',
      normalRange: '< 10,0 (média estável ~6–8 mm durante toda a gestação)',
      unit: 'mm',
      minVal: 3.0,
      maxVal: 9.9,
      clinicalNote:
          'Ventriculomegalia leve: 10,0–12,0 mm | moderada: 12,1–15,0 mm | grave: > 15,0 mm.',
    ),
    ReferenceMeasurement(
      id: 'fet-2-cisterna',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (14–27s6d)',
      structure: 'Cisterna Magna (Fossa Posterior)',
      normalRange: '2,0 a 10,0',
      unit: 'mm',
      minVal: 2.0,
      maxVal: 10.0,
      clinicalNote:
          'Medida no plano transcerebelar; < 2 mm pode sugerir malformação de Chiari II (espinha bífida) e > 10 mm megacisterna magna.',
    ),
    ReferenceMeasurement(
      id: 'fet-2-prega',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (16–22s)',
      structure: 'Prega Nucal (Morfológico 2º Trim)',
      normalRange: '< 6,0',
      unit: 'mm',
      minVal: 1.0,
      maxVal: 5.9,
      clinicalNote:
          'Espessamento ≥ 6,0 mm entre 16 e 22 semanas é marcador ultrassonográfico importante.',
    ),
    ReferenceMeasurement(
      id: 'fet-2-colo',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.second,
      category: '2º Trimestre (18–24s)',
      structure: 'Comprimento do Colo Uterino (Via Transvaginal)',
      normalRange: '≥ 25,0 (habitualmente 30 a 45 mm)',
      unit: 'mm',
      minVal: 25.0,
      maxVal: 55.0,
      clinicalNote:
          'Colo < 25 mm antes de 24 semanas aumenta risco de parto prematuro espontâneo.',
    ),

    // ================= 3º TRIMESTRE =================
    ReferenceMeasurement(
      id: 'fet-3-dbp',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.third,
      category: '3º Trimestre (28–40s)',
      structure: 'Diâmetro Biparietal (DBP)',
      normalRange: '28s: 69–73 · 32s: 78–83 · 36s: 86–92 · 40s: 91–97',
      unit: 'mm',
      minVal: 66.0,
      maxVal: 99.0,
      clinicalNote:
          'No 3º trimestre, a correlação com CC e CA é fundamental para avaliar simetria do crescimento.',
    ),
    ReferenceMeasurement(
      id: 'fet-3-cc',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.third,
      category: '3º Trimestre (28–40s)',
      structure: 'Circunferência Cefálica (CC / HC)',
      normalRange: '28s: 255–272 · 32s: 288–306 · 36s: 314–333 · 40s: 332–353',
      unit: 'mm',
      minVal: 245.0,
      maxVal: 360.0,
      clinicalNote:
          'Avaliar relação CC/CA para diferenciar RCIU simétrica de assimétrica.',
    ),
    ReferenceMeasurement(
      id: 'fet-3-ca',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.third,
      category: '3º Trimestre (28–40s)',
      structure: 'Circunferência Abdominal (CA / AC)',
      normalRange: '28s: 230–252 · 32s: 268–294 · 36s: 305–334 · 40s: 335–368',
      unit: 'mm',
      minVal: 220.0,
      maxVal: 375.0,
      clinicalNote:
          'Parâmetro mais sensível isoladamente para restrição de crescimento fetal (CA < p10) e macrossomia (CA > p90).',
    ),
    ReferenceMeasurement(
      id: 'fet-3-cf',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.third,
      category: '3º Trimestre (28–40s)',
      structure: 'Comprimento do Fêmur (CF / FL)',
      normalRange: '28s: 51–55 · 32s: 59–64 · 36s: 67–72 · 40s: 72–78',
      unit: 'mm',
      minVal: 49.0,
      maxVal: 80.0,
      clinicalNote:
          'Acompanha o crescimento longitudinal fetal no 3º trimestre.',
    ),
    ReferenceMeasurement(
      id: 'fet-3-pfe',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.third,
      category: '3º Trimestre (28–40s)',
      structure: 'Peso Fetal Estimado (Hadlock · p10–p90)',
      normalRange:
          '28s: 950–1.350 g · 32s: 1.600–2.250 g · 36s: 2.400–3.250 g · 40s: 3.000–4.000 g',
      unit: 'g',
      minVal: 950.0,
      maxVal: 4000.0,
      clinicalNote:
          'PIG/RCIU: < p10 (ou < p3). GIG: > p90. Correlacionar sempre com Doppler fetal na suspeita de RCIU.',
    ),
    ReferenceMeasurement(
      id: 'fet-3-ila',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.third,
      category: '3º Trimestre (28–40s)',
      structure: 'Índice de Líquido Amniótico (ILA) / MBV',
      normalRange: 'ILA: 5,0 a 24,0 cm · MBV (Maior Bolsão): 2,0 a 8,0 cm',
      unit: 'cm',
      minVal: 5.0,
      maxVal: 24.0,
      clinicalNote:
          'Oligoidrâmnio: ILA < 5,0 cm ou MBV < 2,0 cm. Polidrâmnio: ILA > 24–25 cm ou MBV > 8,0 cm.',
    ),
    ReferenceMeasurement(
      id: 'fet-3-doppler-au',
      group: ReferenceGroup.fetal,
      trimester: FetalTrimester.third,
      category: '3º Trimestre (Doppler)',
      structure: 'Doppler Artéria Umbilical (IP) & ACM',
      normalRange:
          'AU IP < 1,2–1,4 (diástole positiva) · ACM IP > 1,0–1,3 · RCP (ACM/AU) > 1,0',
      unit: 'IP',
      minVal: 0.5,
      maxVal: 1.35,
      clinicalNote:
          'Centralização fetal: RCP < 1,0 (ou IP ACM < p5). Diástole zero ou reversa na AU indica insuficiência placentária grave.',
    ),
  ];

  // ================= PEDIATRIA: TABELA POR IDADE PARA CADA ÓRGÃO =================
  static const List<PediatricOrganTable> pediatricOrganTables = [
    PediatricOrganTable(
      organ: 'Rins (Comprimento Bipolar)',
      parameter: 'Eixo longitudinal renal (cm)',
      unit: 'cm',
      generalNote:
          'Diferença normal entre rim direito e esquerdo < 1,0 cm. Pelve renal AP normal: < 4 mm (até 2º trim), < 7 mm no RN/lactente e < 10 mm em crianças maiores.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: '3,8 a 5,0', minVal: 3.8, maxVal: 5.0, note: 'Prematuros podem medir 3,2–4,2 cm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: '4,5 a 6,0', minVal: 4.5, maxVal: 6.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: '5,2 a 6,8', minVal: 5.2, maxVal: 6.8),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: '6,0 a 7,6', minVal: 6.0, maxVal: 7.6),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: '7,0 a 8,6', minVal: 7.0, maxVal: 8.6),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: '7,8 a 9,6', minVal: 7.8, maxVal: 9.6),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: '8,6 a 10,8', minVal: 8.6, maxVal: 10.8),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: '9,2 a 11,8', minVal: 9.2, maxVal: 11.8),
      ],
    ),
    PediatricOrganTable(
      organ: 'Fígado (Lobo Direito - LHC)',
      parameter: 'Eixo longitudinal na linha hemiclavicular (cm)',
      unit: 'cm',
      generalNote:
          'Medir em decúbito dorsal no plano sagital na linha hemiclavicular direita. Avaliar sempre ecotextura e borda hepática inferior.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: '4,5 a 6,5', minVal: 4.5, maxVal: 6.5),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: '5,5 a 7,8', minVal: 5.5, maxVal: 7.8),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: '6,5 a 8,8', minVal: 6.5, maxVal: 8.8),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: '7,5 a 10,0', minVal: 7.5, maxVal: 10.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: '8,5 a 11,2', minVal: 8.5, maxVal: 11.2),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: '9,5 a 12,5', minVal: 9.5, maxVal: 12.5),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: '10,5 a 13,8', minVal: 10.5, maxVal: 13.8),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: '11,0 a 14,8', minVal: 11.0, maxVal: 14.8),
      ],
    ),
    PediatricOrganTable(
      organ: 'Baço (Eixo Longitudinal)',
      parameter: 'Maior eixo esplênico no plano coronal (cm)',
      unit: 'cm',
      generalNote:
          'Medida obtida pelo maior comprimento do polo superior ao inferior no plano intercostal oblíquo esquerdo.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: '3,2 a 5,0', minVal: 3.2, maxVal: 5.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: '4,0 a 6,0', minVal: 4.0, maxVal: 6.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: '4,8 a 6,8', minVal: 4.8, maxVal: 6.8),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: '5,5 a 7,8', minVal: 5.5, maxVal: 7.8),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: '6,5 a 9,0', minVal: 6.5, maxVal: 9.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: '7,2 a 10,2', minVal: 7.2, maxVal: 10.2),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: '8,0 a 11,2', minVal: 8.0, maxVal: 11.2),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: '8,5 a 12,2', minVal: 8.5, maxVal: 12.2),
      ],
    ),
    PediatricOrganTable(
      organ: 'Vesícula & Colédoco',
      parameter: 'Colédoco (mm) · Parede vesicular < 3 mm',
      unit: 'mm',
      generalNote:
          'Parede da vesícula normal ≤ 3,0 mm em jejum. Colédoco dilatado acima dos limites abaixo sugere obstrução biliar ou cisto de colédoco.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: 'Colédoco ≤ 1,2 · Vesícula 15–30 mm', minVal: 0.3, maxVal: 1.2),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: 'Colédoco ≤ 1,5 · Vesícula 20–35 mm', minVal: 0.5, maxVal: 1.5),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: 'Colédoco ≤ 2,0 · Vesícula 25–40 mm', minVal: 0.5, maxVal: 2.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: 'Colédoco ≤ 2,5 · Vesícula 30–50 mm', minVal: 0.8, maxVal: 2.5),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: 'Colédoco ≤ 3,0 · Vesícula 35–60 mm', minVal: 1.0, maxVal: 3.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: 'Colédoco ≤ 3,5 · Vesícula 40–70 mm', minVal: 1.0, maxVal: 3.5),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: 'Colédoco ≤ 4,5 · Vesícula 45–80 mm', minVal: 1.5, maxVal: 4.5),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: 'Colédoco ≤ 5,0 · Vesícula 50–85 mm', minVal: 1.5, maxVal: 5.0),
      ],
    ),
    PediatricOrganTable(
      organ: 'Pâncreas',
      parameter: 'Cabeça / Corpo / Cauda (mm AP)',
      unit: 'mm',
      generalNote:
          'Em crianças pequenas, o parênquima pancreático pode ser discretamente mais ecogênico que o fígado sem significado patológico. Ducto de Wirsung ≤ 1,5–2,0 mm.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: 'Cabeça 8–14 · Corpo 5–9 · Cauda 7–13', minVal: 5.0, maxVal: 14.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: 'Cabeça 9–16 · Corpo 6–10 · Cauda 8–14', minVal: 6.0, maxVal: 16.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: 'Cabeça 10–17 · Corpo 6–11 · Cauda 9–15', minVal: 6.0, maxVal: 17.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: 'Cabeça 12–19 · Corpo 7–12 · Cauda 10–17', minVal: 7.0, maxVal: 19.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: 'Cabeça 14–21 · Corpo 8–13 · Cauda 12–19', minVal: 8.0, maxVal: 21.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: 'Cabeça 15–23 · Corpo 9–15 · Cauda 13–21', minVal: 9.0, maxVal: 23.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: 'Cabeça 17–25 · Corpo 10–17 · Cauda 15–23', minVal: 10.0, maxVal: 25.0),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: 'Cabeça 18–27 · Corpo 11–18 · Cauda 16–25', minVal: 11.0, maxVal: 27.0),
      ],
    ),
    PediatricOrganTable(
      organ: 'Tireoide',
      parameter: 'Volume total (mL) e espessura AP do lobo (mm)',
      unit: 'mL / mm',
      generalNote:
          'Volume de cada lobo = C x L x AP x 0,52 (ou 0,479). Ecotextura deve ser homogênea sem linfonodomegalias atípicas.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: 'Vol: 0,4–1,4 mL · AP: 5–8 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: 'Vol: 0,8–1,8 mL · AP: 6–9 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: 'Vol: 1,0–2,2 mL · AP: 7–10 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: 'Vol: 1,4–3,2 mL · AP: 8–11 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: 'Vol: 2,0–4,5 mL · AP: 9–12 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: 'Vol: 3,0–6,5 mL · AP: 10–14 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: 'Vol: 4,5–10,5 mL · AP: 11–16 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: 'Vol: 6,0–14,5 mL · AP: 12–17 mm'),
      ],
    ),
    PediatricOrganTable(
      organ: 'Bexiga & Trato Urinário',
      parameter: 'Parede vesical (mm) e capacidade vesical estimada (mL)',
      unit: 'mL / mm',
      generalNote:
          'Fórmula prática (> 1 ano): Capacidade (mL) ≈ (idade em anos + 2) x 30. Parede cheia < 3 mm; parcialmente vazia < 5 mm.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: 'Cap: 20–40 mL · Parede ≤ 3 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: 'Cap: 35–65 mL · Parede ≤ 3 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: 'Cap: 60–90 mL · Parede ≤ 3 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: 'Cap: 90–150 mL · Parede ≤ 3 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: 'Cap: 180–240 mL · Parede ≤ 3 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: 'Cap: 270–360 mL · Parede ≤ 3 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: 'Cap: 390–480 mL · Parede ≤ 3 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: 'Cap: 450–550 mL · Parede ≤ 3 mm'),
      ],
    ),
    PediatricOrganTable(
      organ: 'Tubo Digestivo (Piloro & Apêndice)',
      parameter: 'Espessura muscular pilórica & diâmetro apendicular (mm)',
      unit: 'mm',
      generalNote:
          'Estenose hipertrófica de piloro (EHP): músculo ≥ 3,0 mm e comprimento ≥ 15–17 mm. Apendicite aguda: diâmetro ≥ 6,0 mm não compressível.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: 'Piloro < 3,0 mm (comp < 15 mm) · Apêndice < 5,5 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: 'Piloro < 3,0 mm (comp < 15 mm) · Apêndice < 5,5 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: 'Apêndice < 6,0 mm (compressível)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: 'Apêndice < 6,0 mm (parede < 2 mm)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: 'Apêndice < 6,0 mm (parede < 2 mm)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: 'Apêndice < 6,0 mm (parede < 2 mm)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: 'Apêndice < 6,0 mm (parede < 2 mm)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: 'Apêndice < 6,0 mm (parede < 2 mm)'),
      ],
    ),
    PediatricOrganTable(
      organ: 'Útero & Ovários (Pediátrico)',
      parameter: 'Comprimento uterino (cm) & volume ovariano (cm³)',
      unit: 'cm / cm³',
      generalNote:
          'No RN há estímulo estrogênico materno transitório (útero maior com endométrio visível). Na fase pré-púbere o colo é maior que o corpo (1:2).',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: 'Útero 3,0–4,2 cm · Ovários 0,5–1,5 cm³'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: 'Útero 2,0–3,0 cm · Ovários 0,3–1,0 cm³'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: 'Útero 2,0–3,0 cm · Ovários 0,3–1,0 cm³'),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: 'Útero 2,2–3,3 cm · Ovários 0,4–1,2 cm³'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: 'Útero 2,5–3,6 cm · Ovários 0,6–1,5 cm³'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: 'Útero 2,8–4,2 cm · Ovários 0,8–2,5 cm³'),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: 'Útero 4,0–7,0 cm · Ovários 2,0–6,5 cm³'),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: 'Útero 5,5–8,5 cm · Ovários 3,0–9,5 cm³'),
      ],
    ),
    PediatricOrganTable(
      organ: 'Transfontanela (Cérebro)',
      parameter: 'Corno frontal ventrículo lateral & espaço subaracnóideo (mm)',
      unit: 'mm',
      generalNote:
          'Avaliação via fontanela anterior enquanto aberta (habitualmente até 12–18 meses). IR normal da artéria cerebral anterior: 0,60–0,85 após 72h de vida.',
      rows: [
        PediatricOrganRow(ageBand: PediatricAgeBand.newborn, normalRange: 'Corno frontal < 3 mm · Sinocortical < 4 mm · IR ACA 0,60–0,85'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant1to6m, normalRange: 'Corno frontal < 3–4 mm · Espaço subaracnóideo < 4–5 mm'),
        PediatricOrganRow(ageBand: PediatricAgeBand.infant6to12m, normalRange: 'Corno frontal < 4 mm · Fechamento progressivo da fontanela'),
        PediatricOrganRow(ageBand: PediatricAgeBand.toddler1to3y, normalRange: 'Fontanela habitualmente fechada (> 12–18m)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child4to6y, normalRange: 'Não aplicável (janela transfontanela fechada)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.child7to10y, normalRange: 'Não aplicável (janela transfontanela fechada)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.preteen11to14y, normalRange: 'Não aplicável (janela transfontanela fechada)'),
        PediatricOrganRow(ageBand: PediatricAgeBand.teen15to17y, normalRange: 'Não aplicável (janela transfontanela fechada)'),
      ],
    ),
  ];

  // ================= ADULTO =================
  static const List<ReferenceMeasurement> adultMeasurements = [
    ReferenceMeasurement(
      id: 'adu-figado-lhd',
      group: ReferenceGroup.adult,
      category: 'Fígado',
      structure: 'Lobo Hepático Direito (Linha Hemiclavicular)',
      normalRange: '≤ 15,0 a 15,5',
      unit: 'cm',
      minVal: 10.0,
      maxVal: 15.5,
      clinicalNote:
          'Medidas > 16,0 cm indicam hepatomegalia. Lobo esquerdo AP normal ≤ 6,0–7,0 cm.',
    ),
    ReferenceMeasurement(
      id: 'adu-figado-porta',
      group: ReferenceGroup.adult,
      category: 'Fígado',
      structure: 'Veia Porta (Calibre no Hilo)',
      normalRange: '≤ 12,0 a 13,0 (velocidade fluxo 15–30 cm/s)',
      unit: 'mm',
      minVal: 6.0,
      maxVal: 13.0,
      clinicalNote:
          'Calibre > 13 mm ou redução da variação respiratória sugere hipertensão portal.',
    ),
    ReferenceMeasurement(
      id: 'adu-vesicula-parede',
      group: ReferenceGroup.adult,
      category: 'Vesícula e Vias Biliares',
      structure: 'Parede da Vesícula Biliar',
      normalRange: '≤ 3,0',
      unit: 'mm',
      minVal: 1.0,
      maxVal: 3.0,
      clinicalNote:
          'Medir na parede anterior em jejum. Eixo longitudinal normal ≤ 10 cm e transverso ≤ 4 cm.',
    ),
    ReferenceMeasurement(
      id: 'adu-coledoco',
      group: ReferenceGroup.adult,
      category: 'Vesícula e Vias Biliares',
      structure: 'Colédoco (Via Biliar Principal)',
      normalRange: '≤ 6,0 (até 8–10 mm em idosos ou pós-colecistectomia)',
      unit: 'mm',
      minVal: 2.0,
      maxVal: 6.0,
      clinicalNote:
          'Regra prática: ~1 mm por década acima dos 60 anos. Vias intra-hepáticas normais ≤ 2 mm.',
    ),
    ReferenceMeasurement(
      id: 'adu-baco',
      group: ReferenceGroup.adult,
      category: 'Baço',
      structure: 'Comprimento Longitudinal Esplênico',
      normalRange: '8,0 a 12,5 (espessura hilar ≤ 5,0 cm)',
      unit: 'cm',
      minVal: 8.0,
      maxVal: 12.5,
      clinicalNote:
          'Esplenomegalia franca > 13,0 cm; índice esplênico (C x L x AP) normal < 480.',
    ),
    ReferenceMeasurement(
      id: 'adu-pancreas',
      group: ReferenceGroup.adult,
      category: 'Pâncreas',
      structure: 'Dimensões Pancreatícas (Cabeça / Corpo / Cauda)',
      normalRange: 'Cabeça ≤ 30 · Corpo ≤ 22 · Cauda ≤ 28 · Wirsung ≤ 2–3',
      unit: 'mm',
      minVal: 10.0,
      maxVal: 30.0,
      clinicalNote:
          'Ecogenicidade aumenta fisiologicamente com a idade e obesidade (lipossubstituição).',
    ),
    ReferenceMeasurement(
      id: 'adu-rim',
      group: ReferenceGroup.adult,
      category: 'Rins e Vias Urinárias',
      structure: 'Comprimento Renal Bipolar',
      normalRange: '9,0 a 12,5',
      unit: 'cm',
      minVal: 9.0,
      maxVal: 12.5,
      clinicalNote:
          'Espessura parenquimatosa normal 14–20 mm; cortical 7–11 mm; assimetria normal < 1,5 cm.',
    ),
    ReferenceMeasurement(
      id: 'adu-pelve-renal',
      group: ReferenceGroup.adult,
      category: 'Rins e Vias Urinárias',
      structure: 'Pelve Renal (Diâmetro Anteroposterior)',
      normalRange: '< 10,0',
      unit: 'mm',
      minVal: 0.0,
      maxVal: 9.9,
      clinicalNote:
          'Bexiga muito cheia pode causar discreta ectasia fisiológica reversível pós-micção.',
    ),
    ReferenceMeasurement(
      id: 'adu-bexiga',
      group: ReferenceGroup.adult,
      category: 'Bexiga e Próstata',
      structure: 'Parede Vesical & Resíduo Pós-Miccional',
      normalRange: 'Parede cheia ≤ 3,0 mm · Vazia ≤ 5,0 mm · Resíduo < 50 mL',
      unit: 'mm / mL',
      minVal: 1.0,
      maxVal: 3.0,
      clinicalNote:
          'Resíduo > 50–100 mL é significativo dependendo da idade e sintomas miccionais.',
    ),
    ReferenceMeasurement(
      id: 'adu-prostata',
      group: ReferenceGroup.adult,
      category: 'Bexiga e Próstata',
      structure: 'Próstata (Volume Estimado)',
      normalRange: '≤ 25 a 30 (dimensões ~40 x 30 x 25 mm)',
      unit: 'cm³ / g',
      minVal: 12.0,
      maxVal: 30.0,
      clinicalNote:
          'HPB leve: 30–50 cm³ | moderada: 50–80 cm³ | acentuada: > 80 cm³.',
    ),
    ReferenceMeasurement(
      id: 'adu-tireoide',
      group: ReferenceGroup.adult,
      category: 'Tireoide',
      structure: 'Lobos Tireoidianos, Istmo e Volume Total',
      normalRange: 'Vol total: 6 a 18 mL · Lobo: 40–60 x 13–18 mm · Istmo ≤ 4–5 mm',
      unit: 'mL / mm',
      minVal: 6.0,
      maxVal: 18.0,
      clinicalNote:
          'Bócio se volume total > 18 mL (mulheres) ou > 20–25 mL (homens). Avaliar nódulos por ACR TI-RADS.',
    ),
    ReferenceMeasurement(
      id: 'adu-utero',
      group: ReferenceGroup.adult,
      category: 'Útero e Ovários',
      structure: 'Útero (Comprimento e Volume)',
      normalRange: 'Menacme: 6–9 cm (30–90 cm³) · Pós-menopausa: 3,5–6,0 cm',
      unit: 'cm / cm³',
      minVal: 6.0,
      maxVal: 9.0,
      clinicalNote:
          'Multíparas podem ter volume uterino discretamente maior (até ~110–120 cm³) sem patologia.',
    ),
    ReferenceMeasurement(
      id: 'adu-endometrio',
      group: ReferenceGroup.adult,
      category: 'Útero e Ovários',
      structure: 'Eco Endometrial (Espessura)',
      normalRange:
          'Proliferativa: 4–8 · Secretora: 8–14 · Pós-menopausa sem TRH: ≤ 4–5',
      unit: 'mm',
      minVal: 2.0,
      maxVal: 14.0,
      clinicalNote:
          'Na pós-menopausa com sangramento e endométrio > 4–5 mm, recomenda-se investigação complementar.',
    ),
    ReferenceMeasurement(
      id: 'adu-ovarios',
      group: ReferenceGroup.adult,
      category: 'Útero e Ovários',
      structure: 'Ovários (Volume)',
      normalRange: 'Menacme: 3,0 a 10,0 cm³ · Pós-menopausa: < 3,0 cm³',
      unit: 'cm³',
      minVal: 3.0,
      maxVal: 10.0,
      clinicalNote:
          'Folículos dominantes pré-ovulatórios podem atingir 18–25 mm fisiologicamente.',
    ),
    ReferenceMeasurement(
      id: 'adu-aorta',
      group: ReferenceGroup.adult,
      category: 'Aorta e Vascular',
      structure: 'Aorta Abdominal Infrarrenal (Diâmetro AP)',
      normalRange: '< 2,5 (ectasia: 2,5–2,9 cm · aneurisma: ≥ 3,0 cm)',
      unit: 'cm',
      minVal: 1.4,
      maxVal: 2.4,
      clinicalNote:
          'Medir de parede externa a externa. Aorta suprarrenal normal até ~2,5–2,8 cm.',
    ),
    ReferenceMeasurement(
      id: 'adu-carotida',
      group: ReferenceGroup.adult,
      category: 'Aorta e Vascular',
      structure: 'Artéria Carótida Interna (PSV / EMI)',
      normalRange: 'PSV < 125 cm/s · Espessura Médio-Intimal (EMI) < 0,9 mm',
      unit: 'cm/s',
      minVal: 40.0,
      maxVal: 124.0,
      clinicalNote:
          'Critérios NASCET/SRU: PSV 125–230 cm/s sugere estenose 50–69%; > 230 cm/s sugere ≥ 70%.',
    ),
  ];
}
