import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../data/usg_reference_measurements.dart';

class MeasurementsReferenceView extends StatefulWidget {
  const MeasurementsReferenceView({super.key});

  @override
  State<MeasurementsReferenceView> createState() =>
      _MeasurementsReferenceViewState();
}

class _MeasurementsReferenceViewState extends State<MeasurementsReferenceView> {
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _testValueController = TextEditingController();

  ReferenceGroup _selectedGroup = ReferenceGroup.fetal;
  FetalTrimester? _selectedTrimester = FetalTrimester.first;
  PediatricAgeBand _selectedPediatricAge = PediatricAgeBand.child4to6y;
  String _selectedPediatricOrgan = 'Todos';
  String _selectedAdultCategory = 'Todos';
  String _searchQuery = '';
  String? _expandedPediatricTableOrgan;
  String? _activeCheckerId;

  @override
  void dispose() {
    _searchController.dispose();
    _testValueController.dispose();
    super.dispose();
  }

  void _copyReference(String title, String range, String unit) {
    final text = '$title: $range ${unit.isNotEmpty ? unit : ''}'.trim();
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Referência copiada: $text'),
        duration: const Duration(seconds: 2),
        backgroundColor: const Color(0xFF0B4F5E),
      ),
    );
  }

  Widget _buildQuickChecker(double? minVal, double? maxVal, String unit) {
    final raw = _testValueController.text.trim().replaceAll(',', '.');
    final parsed = double.tryParse(raw);

    String? statusLabel;
    Color statusColor = const Color(0xFF94A3B8);
    IconData statusIcon = Icons.info_outline;

    if (parsed != null && (minVal != null || maxVal != null)) {
      if (minVal != null && parsed < minVal) {
        statusLabel = 'Abaixo da referência (< $minVal $unit)';
        statusColor = const Color(0xFFF59E0B);
        statusIcon = Icons.arrow_downward_rounded;
      } else if (maxVal != null && parsed > maxVal) {
        statusLabel = 'Acima da referência (> $maxVal $unit)';
        statusColor = const Color(0xFFF43F5E);
        statusIcon = Icons.arrow_upward_rounded;
      } else {
        statusLabel = 'Dentro da faixa normal ($minVal–$maxVal $unit)';
        statusColor = const Color(0xFF10B981);
        statusIcon = Icons.check_circle_outline_rounded;
      }
    }

    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF090D16),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _testValueController,
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (_) => setState(() {}),
                  style: const TextStyle(fontSize: 13, color: Colors.white),
                  decoration: InputDecoration(
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 8,
                    ),
                    labelText: 'Comparar medida ($unit)',
                    labelStyle: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF94A3B8),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                tooltip: 'Limpar valor',
                onPressed: () {
                  _testValueController.clear();
                  setState(() {});
                },
                icon: const Icon(Icons.clear, size: 18, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
          if (statusLabel != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(statusIcon, size: 16, color: statusColor),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMeasurementCard(ReferenceMeasurement item) {
    final isCheckerOpen = _activeCheckerId == item.id;
    final hasRange = item.minVal != null || item.maxVal != null;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.category,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF38BDF8),
                        letterSpacing: 0.4,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      item.structure,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                tooltip: 'Copiar referência',
                visualDensity: VisualDensity.compact,
                icon: const Icon(
                  Icons.copy_rounded,
                  size: 18,
                  color: Color(0xFF94A3B8),
                ),
                onPressed: () => _copyReference(
                  item.structure,
                  item.normalRange,
                  item.unit,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF083D4A).withAlpha(110),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: const Color(0xFF0B4F5E),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.straighten_rounded,
                  size: 16,
                  color: Color(0xFF38BDF8),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${item.normalRange} ${item.unit}',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFE2E8F0),
                    ),
                  ),
                ),
              ],
            ),
          ),
          if (item.clinicalNote != null && item.clinicalNote!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              item.clinicalNote!,
              style: const TextStyle(
                fontSize: 12,
                height: 1.4,
                color: Color(0xFF94A3B8),
              ),
            ),
          ],
          if (hasRange) ...[
            const SizedBox(height: 6),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                onPressed: () {
                  setState(() {
                    if (isCheckerOpen) {
                      _activeCheckerId = null;
                    } else {
                      _activeCheckerId = item.id;
                      _testValueController.clear();
                    }
                  });
                },
                icon: Icon(
                  isCheckerOpen ? Icons.expand_less : Icons.calculate_outlined,
                  size: 16,
                  color: const Color(0xFF38BDF8),
                ),
                label: Text(
                  isCheckerOpen ? 'Ocultar comparador' : 'Comparar valor medido',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF38BDF8),
                  ),
                ),
              ),
            ),
            if (isCheckerOpen)
              _buildQuickChecker(item.minVal, item.maxVal, item.unit),
          ],
        ],
      ),
    );
  }

  Widget _buildFetalSection() {
    final query = _searchQuery.toLowerCase();
    final items = UsgReferenceData.fetalMeasurements.where((m) {
      final matchesTrimester =
          _selectedTrimester == null || m.trimester == _selectedTrimester;
      final matchesSearch = query.isEmpty ||
          m.structure.toLowerCase().contains(query) ||
          m.normalRange.toLowerCase().contains(query) ||
          (m.clinicalNote ?? '').toLowerCase().contains(query);
      return matchesTrimester && matchesSearch;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              ChoiceChip(
                label: const Text('1º Trimestre'),
                selected: _selectedTrimester == FetalTrimester.first,
                onSelected: (_) =>
                    setState(() => _selectedTrimester = FetalTrimester.first),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('2º Trimestre'),
                selected: _selectedTrimester == FetalTrimester.second,
                onSelected: (_) =>
                    setState(() => _selectedTrimester = FetalTrimester.second),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('3º Trimestre'),
                selected: _selectedTrimester == FetalTrimester.third,
                onSelected: (_) =>
                    setState(() => _selectedTrimester = FetalTrimester.third),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Todos Trimestres'),
                selected: _selectedTrimester == null,
                onSelected: (_) => setState(() => _selectedTrimester = null),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        if (items.isEmpty)
          _buildEmptyState()
        else
          ...items.map(_buildMeasurementCard),
      ],
    );
  }

  Widget _buildPediatricSection() {
    final query = _searchQuery.toLowerCase();
    final organs = [
      'Todos',
      ...UsgReferenceData.pediatricOrganTables.map((t) => t.organ),
    ];

    final tables = UsgReferenceData.pediatricOrganTables.where((t) {
      final matchesOrgan =
          _selectedPediatricOrgan == 'Todos' || t.organ == _selectedPediatricOrgan;
      final matchesQuery = query.isEmpty ||
          t.organ.toLowerCase().contains(query) ||
          t.parameter.toLowerCase().contains(query) ||
          t.generalNote.toLowerCase().contains(query) ||
          t.rows.any((r) => r.normalRange.toLowerCase().contains(query));
      return matchesOrgan && matchesQuery;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Faixa Etária Pediátrica',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF94A3B8),
          ),
        ),
        const SizedBox(height: 6),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: PediatricAgeBand.values.map((band) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(band.label),
                  selected: _selectedPediatricAge == band,
                  onSelected: (_) =>
                      setState(() => _selectedPediatricAge = band),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 10),
        const Text(
          'Órgão / Sistema',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Color(0xFF94A3B8),
          ),
        ),
        const SizedBox(height: 6),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: organs.map((organ) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(organ),
                  selected: _selectedPediatricOrgan == organ,
                  onSelected: (_) =>
                      setState(() => _selectedPediatricOrgan = organ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 14),
        if (tables.isEmpty)
          _buildEmptyState()
        else
          ...tables.map((table) {
            final currentRow = table.rows.firstWhere(
              (r) => r.ageBand == _selectedPediatricAge,
              orElse: () => table.rows.first,
            );
            final isTableExpanded = _expandedPediatricTableOrgan == table.organ;
            final checkerKey = 'ped-${table.organ}-${currentRow.ageBand.name}';
            final isCheckerOpen = _activeCheckerId == checkerKey;
            final hasRange =
                currentRow.minVal != null || currentRow.maxVal != null;

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${_selectedPediatricAge.label} · ${table.parameter}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF38BDF8),
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              table.organ,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        tooltip: 'Copiar referência',
                        visualDensity: VisualDensity.compact,
                        icon: const Icon(
                          Icons.copy_rounded,
                          size: 18,
                          color: Color(0xFF94A3B8),
                        ),
                        onPressed: () => _copyReference(
                          '${table.organ} (${_selectedPediatricAge.label})',
                          currentRow.normalRange,
                          table.unit,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF083D4A).withAlpha(110),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF0B4F5E)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.child_care_rounded,
                          size: 16,
                          color: Color(0xFF38BDF8),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            '${currentRow.normalRange} ${table.unit}',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFFE2E8F0),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (currentRow.note != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      currentRow.note!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF38BDF8),
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    table.generalNote,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.4,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 12,
                    runSpacing: 4,
                    children: [
                      TextButton.icon(
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        onPressed: () {
                          setState(() {
                            _expandedPediatricTableOrgan =
                                isTableExpanded ? null : table.organ;
                          });
                        },
                        icon: Icon(
                          isTableExpanded
                              ? Icons.table_rows_rounded
                              : Icons.table_chart_outlined,
                          size: 16,
                          color: const Color(0xFF38BDF8),
                        ),
                        label: Text(
                          isTableExpanded
                              ? 'Ocultar tabela por idade'
                              : 'Ver tabela completa por idade',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF38BDF8),
                          ),
                        ),
                      ),
                      if (hasRange)
                        TextButton.icon(
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          onPressed: () {
                            setState(() {
                              if (isCheckerOpen) {
                                _activeCheckerId = null;
                              } else {
                                _activeCheckerId = checkerKey;
                                _testValueController.clear();
                              }
                            });
                          },
                          icon: Icon(
                            isCheckerOpen
                                ? Icons.expand_less
                                : Icons.calculate_outlined,
                            size: 16,
                            color: const Color(0xFF38BDF8),
                          ),
                          label: Text(
                            isCheckerOpen
                                ? 'Ocultar comparador'
                                : 'Comparar valor medido',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF38BDF8),
                            ),
                          ),
                        ),
                    ],
                  ),
                  if (isCheckerOpen)
                    _buildQuickChecker(
                      currentRow.minVal,
                      currentRow.maxVal,
                      table.unit,
                    ),
                  if (isTableExpanded) ...[
                    const SizedBox(height: 10),
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF090D16),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF1E293B)),
                      ),
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: DataTable(
                          headingRowHeight: 36,
                          dataRowMinHeight: 34,
                          dataRowMaxHeight: 46,
                          columnSpacing: 18,
                          columns: [
                            const DataColumn(
                              label: Text(
                                'Idade',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF38BDF8),
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'Referência (${table.unit})',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF38BDF8),
                                ),
                              ),
                            ),
                          ],
                          rows: table.rows.map((row) {
                            final isCurrent =
                                row.ageBand == _selectedPediatricAge;
                            return DataRow(
                              selected: isCurrent,
                              color: WidgetStateProperty.resolveWith<Color?>(
                                (_) => isCurrent
                                    ? const Color(0xFF0B4F5E).withAlpha(90)
                                    : null,
                              ),
                              cells: [
                                DataCell(
                                  Text(
                                    row.ageBand.label,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: isCurrent
                                          ? FontWeight.w700
                                          : FontWeight.w400,
                                      color: isCurrent
                                          ? Colors.white
                                          : const Color(0xFFCBD5E1),
                                    ),
                                  ),
                                ),
                                DataCell(
                                  Text(
                                    row.normalRange,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: isCurrent
                                          ? FontWeight.w700
                                          : FontWeight.w400,
                                      color: isCurrent
                                          ? const Color(0xFF38BDF8)
                                          : const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            );
          }),
      ],
    );
  }

  Widget _buildAdultSection() {
    final query = _searchQuery.toLowerCase();
    final categories = [
      'Todos',
      ...UsgReferenceData.adultMeasurements.map((m) => m.category).toSet(),
    ];

    final items = UsgReferenceData.adultMeasurements.where((m) {
      final matchesCat =
          _selectedAdultCategory == 'Todos' || m.category == _selectedAdultCategory;
      final matchesSearch = query.isEmpty ||
          m.category.toLowerCase().contains(query) ||
          m.structure.toLowerCase().contains(query) ||
          m.normalRange.toLowerCase().contains(query) ||
          (m.clinicalNote ?? '').toLowerCase().contains(query);
      return matchesCat && matchesSearch;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: categories.map((cat) {
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(cat),
                  selected: _selectedAdultCategory == cat,
                  onSelected: (_) =>
                      setState(() => _selectedAdultCategory = cat),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 14),
        if (items.isEmpty)
          _buildEmptyState()
        else
          ...items.map(_buildMeasurementCard),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: const Column(
        children: [
          Icon(Icons.search_off_rounded, size: 32, color: Color(0xFF64748B)),
          SizedBox(height: 8),
          Text(
            'Nenhuma medida encontrada para este filtro.',
            style: TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Cabeçalho explicativo de consulta rápida (sem precisar gerar laudo)
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: const Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: Color(0xFF0B4F5E),
                child: Icon(
                  Icons.straighten_rounded,
                  size: 20,
                  color: Color(0xFF38BDF8),
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Consulta Rápida de Medidas USG',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Valores de referência por idade e órgão (Fetal, Pediatria e Adulto) sem precisar emitir laudo.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // Campo de busca instantânea
        TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val),
          decoration: InputDecoration(
            hintText: 'Buscar órgão ou medida (ex: rim, colédoco, CCN, TN, baço)...',
            hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
            prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF38BDF8)),
            suffixIcon: _searchQuery.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, size: 18),
                    onPressed: () {
                      _searchController.clear();
                      setState(() => _searchQuery = '');
                    },
                  )
                : null,
            filled: true,
            fillColor: const Color(0xFF0F172A),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF1E293B)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF1E293B)),
            ),
          ),
        ),
        const SizedBox(height: 12),

        // Seletor principal: Fetal | Pediatria | Adulto
        SegmentedButton<ReferenceGroup>(
          showSelectedIcon: false,
          segments: const [
            ButtonSegment<ReferenceGroup>(
              value: ReferenceGroup.fetal,
              icon: Icon(Icons.pregnant_woman_rounded, size: 18),
              label: Text('Fetal'),
            ),
            ButtonSegment<ReferenceGroup>(
              value: ReferenceGroup.pediatric,
              icon: Icon(Icons.child_care_rounded, size: 18),
              label: Text('Pediatria'),
            ),
            ButtonSegment<ReferenceGroup>(
              value: ReferenceGroup.adult,
              icon: Icon(Icons.person_outline_rounded, size: 18),
              label: Text('Adulto'),
            ),
          ],
          selected: {_selectedGroup},
          onSelectionChanged: (selection) {
            setState(() {
              _selectedGroup = selection.first;
              _activeCheckerId = null;
            });
          },
        ),
        const SizedBox(height: 16),

        if (_selectedGroup == ReferenceGroup.fetal) _buildFetalSection(),
        if (_selectedGroup == ReferenceGroup.pediatric) _buildPediatricSection(),
        if (_selectedGroup == ReferenceGroup.adult) _buildAdultSection(),
      ],
    );
  }
}
