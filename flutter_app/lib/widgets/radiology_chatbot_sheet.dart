import 'package:flutter/material.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import '../models/models.dart';
import '../services/gemini_radia_service.dart';
import '../services/storage_service.dart';

class RadiologyChatbotSheet extends StatefulWidget {
  final Patient patient;
  final UltrasoundExam exam;
  final GeminiRadiaService aiService;
  final StorageService storageService;

  const RadiologyChatbotSheet({
    super.key,
    required this.patient,
    required this.exam,
    required this.aiService,
    required this.storageService,
  });

  @override
  State<RadiologyChatbotSheet> createState() => _RadiologyChatbotSheetState();
}

class _RadiologyChatbotSheetState extends State<RadiologyChatbotSheet> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  late ChatSession _chatSession;
  bool _fastMode = false;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _initChat();
  }

  Future<void> _initChat() async {
    _chatSession = widget.aiService.createClinicalChat(
      patient: widget.patient,
      exam: widget.exam,
      fastMode: _fastMode,
    );
    final saved = await widget.storageService.loadChatHistory(widget.exam.id);
    if (mounted) {
      setState(() => _messages.addAll(saved));
    }
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _isSending) return;

    setState(() {
      _messages.add(ChatMessage(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        role: 'user',
        text: text,
        timestamp: TimeOfDay.now().format(context),
      ));
      _controller.clear();
      _isSending = true;
    });

    try {
      final response = await _chatSession.sendMessage(Content.text(text));
      setState(() {
        _messages.add(ChatMessage(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          role: 'model',
          text: response.text ?? 'Sem resposta.',
          timestamp: TimeOfDay.now().format(context),
        ));
      });
      await widget.storageService.saveChatHistory(widget.exam.id, _messages);
    } finally {
      if (mounted) setState(() => _isSending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.78,
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'UltrAI Med Chat Clínico',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              SwitchListTile(
                dense: true,
                title: const Text('Rápido', style: TextStyle(fontSize: 12, color: Colors.white70)),
                value: _fastMode,
                onChanged: (v) {
                  setState(() => _fastMode = v);
                  _initChat();
                },
              ),
            ],
          ),
          const Divider(color: Colors.white12),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _messages.length,
              itemBuilder: (_, idx) {
                final msg = _messages[idx];
                final isUser = msg.role == 'user';
                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUser ? const Color(0xFF0B4F5E) : const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(msg.text, style: const TextStyle(color: Colors.white)),
                  ),
                );
              },
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Pergunte sobre critérios ou conduta...',
                    hintStyle: TextStyle(color: Colors.white54),
                  ),
                ),
              ),
              IconButton(
                onPressed: _isSending ? null : _sendMessage,
                icon: const Icon(Icons.send, color: Color(0xFF38BDF8)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
