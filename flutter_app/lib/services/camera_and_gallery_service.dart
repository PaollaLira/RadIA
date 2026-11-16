import 'dart:io';
import 'package:image_picker/image_picker.dart';

class CameraAndGalleryService {
  final ImagePicker _picker = ImagePicker();

  /// Abre a galeria/arquivos do dispositivo (acionado pelo botão superior esquerdo)
  Future<File?> pickImageFromDevice() async {
    final XFile? file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 92,
    );
    if (file == null) return null;
    return File(file.path);
  }

  /// Abre a câmera do celular para fotografar o monitor de ultrassom
  Future<File?> captureFromCamera() async {
    final XFile? file = await _picker.pickImage(
      source: ImageSource.camera,
      preferredCameraDevice: CameraDevice.rear,
      imageQuality: 92,
    );
    if (file == null) return null;
    return File(file.path);
  }
}
