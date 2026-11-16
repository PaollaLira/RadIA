import 'dart:io';
import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/camera_and_gallery_service.dart';
import '../services/gemini_radia_service.dart';
import '../services/storage_service.dart';
import '../widgets/radiology_chatbot_sheet.dart';

class RadiaWorkstationScreen extends StatefulWidget {
  const RadiaWorkstationScreen({super.key});

  @override
  State<RadiaWorkstationScreen> createState() => _RadiaWorkstationScreenState();
}

class _RadiaWorkstationScreenState extends State<RadiaWorkstationScreen> {
  final StorageService _storage = StorageService();
  final CameraAndGalleryService _mediaService = CameraAndGalleryService();
  final GeminiRadiaService _aiService = GeminiRadiaService(
    apiKey: const String.fromEnvironment('GEMINI_API_KEY'),
  );

  final TextEditingController _findingController = TextEditingController();
  File? _selectedImage;
  String? _generatedReport;
  bool _isAnalyzing = false;

  late Patient _activePatient;
  late UltrasoundExam _activeExam;

  @override
  void initState() {
    super.initState();
    _activePatient = Patient(
      id: 'pat-001',
      name: 'Roberto Carlos Silveira',
      age: 58,
      gender: 'M',
      recordNumber: 'HC-2026-9081',
      clinicalIndication: 'Dor súbita em hipocôndrio direito, febre e leucocitose.',
    );
    _activeExam = UltrasoundExam(
      id: 'exam-001',
      patientId: _activePatient.id,
      specialty: UltrasoundSpecialty.abdomen,
      urgency: UrgencyLevel.urgent,
    );
  }

  /// Acionado pelo botão superior esquerdo da barra (carregar imagem do dispositivo)
  Future<void> _handlePickFromDevice() async {
    final file = await _mediaService.pickImageFromDevice();
    if (file != null && mounted) {
      setState(() {
        _selectedImage = file;
        _activeExam.imagePath = file.path;
      });
    }
  }

  Future<void> _handleCaptureCamera() async {
    final file = await _mediaService.captureFromCamera();
    if (file != null && mounted) {
      setState(() {
        _selectedImage = file;
        _activeExam.imagePath = file.path;
      });
    }
  }

  Future<void> _handleGenerateReport() async {
    setState(() => _isAnalyzing = true);
    try {
      final report = await _aiService.generateStructuredReport(
        patient: _activePatient,
        exam: _activeExam,
        imageFile: _selectedImage,
        findingText: _findingController.text,
      );
      if (mounted) setState(() => _generatedReport = report);
    } finally {
      if (mounted) setState(() => _isAnalyzing = false);
    }
  }

  void _openChatbot() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => RadiologyChatbotSheet(
        patient: _activePatient,
        exam: _activeExam,
        aiService: _aiService,
        storageService: _storage,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('RadIA — Copiloto USG'),
        actions: [
          IconButton(
            tooltip: 'Abrir Chat Clínico RadIA',
            icon: const Icon(Icons.chat_bubble_outline),
            onPressed: _openChatbot,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_selectedImage != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(_selectedImage!, height: 220, fit: BoxFit.contain),
            ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _handlePickFromDevice,
                  icon: const Icon(Icons.upload_file_rounded),
                  label: const Text('Carregar do Dispositivo'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _handleCaptureCamera,
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Abrir Câmera'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _findingController,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Achado ecográfico confirmado ou observações',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton.icon(
            onPressed: _isAnalyzing ? null : _handleGenerateReport,
            icon: const Icon(Icons.auto_awesome),
            label: Text(_isAnalyzing ? 'Processando...' : 'Gerar Laudo Padronizado'),
          ),
          if (_generatedReport != null) ...[
            const SizedBox(height: 16),
            Text(_generatedReport!),
          ],
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openChatbot,
        icon: const Icon(Icons.voice_chat),
        label: const Text('RadIA Chat'),
      ),
    );
  }
}
