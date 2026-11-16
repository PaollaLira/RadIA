import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/models.dart';

class StorageService {
  static const String _storageKey = 'radia_flutter_store_v1';

  Future<void> savePatients(List<Patient> patients) async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(patients.map((p) => p.toJson()).toList());
    await prefs.setString('${_storageKey}_patients', encoded);
  }

  Future<List<Patient>> loadPatients() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('${_storageKey}_patients');
    if (raw == null) return _defaultPatients();
    final decoded = jsonDecode(raw) as List;
    return decoded.map((e) => Patient.fromJson(e)).toList();
  }

  Future<void> saveChatHistory(String examId, List<ChatMessage> messages) async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(messages.map((m) => m.toJson()).toList());
    await prefs.setString('${_storageKey}_chat_$examId', encoded);
  }

  Future<List<ChatMessage>> loadChatHistory(String examId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('${_storageKey}_chat_$examId');
    if (raw == null) return [];
    final decoded = jsonDecode(raw) as List;
    return decoded.map((e) => ChatMessage.fromJson(e)).toList();
  }

  List<Patient> _defaultPatients() {
    return [
      Patient(
        id: 'pat-001',
        name: 'Roberto Carlos Silveira',
        age: 58,
        gender: 'M',
        recordNumber: 'HC-2026-9081',
        clinicalIndication:
            'Dor em hipocôndrio direito há 12h, febre (38.4°C) e leucocitose.',
        comorbidities: ['DM2', 'HAS'],
        allergies: ['Dipirona'],
        priorExams: [
          PriorExam(
            id: 'prior-1',
            date: '2024-08-15',
            modality: 'USG',
            region: 'Abdome Superior',
            summary: 'Microlitíase biliar móvel sem sinais inflamatórios.',
          ),
        ],
      ),
    ];
  }
}
