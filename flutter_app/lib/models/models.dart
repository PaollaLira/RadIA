enum UrgencyLevel { emergency, urgent, priority, elective }

enum UltrasoundSpecialty {
  abdomen,
  thyroid,
  breast,
  urinaryKidneys,
  pocusFast,
  pelvicGyn,
  vascularDoppler,
}

class PriorExam {
  final String id;
  final String date;
  final String modality;
  final String region;
  final String summary;

  PriorExam({
    required this.id,
    required this.date,
    required this.modality,
    required this.region,
    required this.summary,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date,
        'modality': modality,
        'region': region,
        'summary': summary,
      };

  factory PriorExam.fromJson(Map<String, dynamic> json) => PriorExam(
        id: json['id'] ?? '',
        date: json['date'] ?? '',
        modality: json['modality'] ?? 'USG',
        region: json['region'] ?? '',
        summary: json['summary'] ?? '',
      );
}

class Patient {
  final String id;
  final String name;
  final int age;
  final String gender;
  final String recordNumber;
  final String clinicalIndication;
  final List<String> comorbidities;
  final List<String> allergies;
  final List<PriorExam> priorExams;

  Patient({
    required this.id,
    required this.name,
    required this.age,
    required this.gender,
    required this.recordNumber,
    required this.clinicalIndication,
    this.comorbidities = const [],
    this.allergies = const [],
    this.priorExams = const [],
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'age': age,
        'gender': gender,
        'recordNumber': recordNumber,
        'clinicalIndication': clinicalIndication,
        'comorbidities': comorbidities,
        'allergies': allergies,
        'priorExams': priorExams.map((e) => e.toJson()).toList(),
      };

  factory Patient.fromJson(Map<String, dynamic> json) => Patient(
        id: json['id'] ?? '',
        name: json['name'] ?? '',
        age: json['age'] ?? 0,
        gender: json['gender'] ?? 'M',
        recordNumber: json['recordNumber'] ?? '',
        clinicalIndication: json['clinicalIndication'] ?? '',
        comorbidities: List<String>.from(json['comorbidities'] ?? []),
        allergies: List<String>.from(json['allergies'] ?? []),
        priorExams: (json['priorExams'] as List? ?? [])
            .map((e) => PriorExam.fromJson(e))
            .toList(),
      );
}

class UltrasoundExam {
  final String id;
  final String patientId;
  final UltrasoundSpecialty specialty;
  UrgencyLevel urgency;
  String status;
  String? imagePath;
  String? manualFindingText;

  UltrasoundExam({
    required this.id,
    required this.patientId,
    required this.specialty,
    required this.urgency,
    this.status = 'PENDING',
    this.imagePath,
    this.manualFindingText,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'patientId': patientId,
        'specialty': specialty.name,
        'urgency': urgency.name,
        'status': status,
        'imagePath': imagePath,
        'manualFindingText': manualFindingText,
      };

  factory UltrasoundExam.fromJson(Map<String, dynamic> json) => UltrasoundExam(
        id: json['id'] ?? '',
        patientId: json['patientId'] ?? '',
        specialty: UltrasoundSpecialty.values.firstWhere(
          (e) => e.name == json['specialty'],
          orElse: () => UltrasoundSpecialty.abdomen,
        ),
        urgency: UrgencyLevel.values.firstWhere(
          (e) => e.name == json['urgency'],
          orElse: () => UrgencyLevel.priority,
        ),
        status: json['status'] ?? 'PENDING',
        imagePath: json['imagePath'],
        manualFindingText: json['manualFindingText'],
      );
}

class ChatMessage {
  final String id;
  final String role; // 'user' | 'model'
  final String text;
  final String timestamp;
  final bool attachedImage;

  ChatMessage({
    required this.id,
    required this.role,
    required this.text,
    required this.timestamp,
    this.attachedImage = false,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'role': role,
        'text': text,
        'timestamp': timestamp,
        'attachedImage': attachedImage,
      };

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        id: json['id'] ?? '',
        role: json['role'] ?? 'user',
        text: json['text'] ?? '',
        timestamp: json['timestamp'] ?? '',
        attachedImage: json['attachedImage'] ?? false,
      );
}
