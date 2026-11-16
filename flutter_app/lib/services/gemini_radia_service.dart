import 'dart:io';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/models.dart';

class GeminiRadiaService {
  final String apiKey;

  GeminiRadiaService({required this.apiKey});

  /// Inicia sessão de chat multi-turno mantendo histórico e instrução de sistema médica
  ChatSession createClinicalChat({
    required Patient patient,
    required UltrasoundExam exam,
    required bool fastMode,
  }) {
    final modelName = fastMode ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';
    final model = GenerativeModel(
      model: modelName,
      apiKey: apiKey,
      systemInstruction: Content.system(
        'Você é o RadIA Chat, copiloto especialista em Ultrassonografia (USG). '
        'Baseie respostas exclusivamente em literatura médica atualizada (ACR TI-RADS, BI-RADS USG, '
        'Tokyo Guidelines, ATLS, EAU, CBR) considerando o histórico de ${patient.name} '
        '(${patient.age} anos, indicação: ${patient.clinicalIndication}).',
      ),
    );
    return model.startChat();
  }

  /// Gera laudo estruturado nas mesmas 7 seções para foto ou achado textual
  Future<String> generateStructuredReport({
    required Patient patient,
    required UltrasoundExam exam,
    File? imageFile,
    String? findingText,
  }) async {
    final model = GenerativeModel(
      model: 'gemini-3.8-flash',
      apiKey: apiKey,
      systemInstruction: Content.system(
        'Gere um laudo radiológico padronizado em 7 seções: '
        '1. Técnica e Protocolo, 2. Achados Detalhados, 3. Impressão Diagnóstica, '
        '4. Estratificação de Urgência, 5. Especialistas Recomendados, '
        '6. Exames Complementares Sugeridos, 7. Literatura Médica Atualizada com Citações.',
      ),
    );

    final parts = <Part>[];
    if (imageFile != null) {
      final bytes = await imageFile.readAsBytes();
      parts.add(DataPart('image/jpeg', bytes));
    }
    parts.add(TextPart(
      'Paciente: ${patient.name} (${patient.age}a). Indicação: ${patient.clinicalIndication}. '
      'Achados/Observação: ${findingText ?? exam.manualFindingText ?? "Analisar imagem anexada."}',
    ));

    final response = await model.generateContent([Content.multi(parts)]);
    return response.text ?? 'Sem resposta gerada.';
  }
}
