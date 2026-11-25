import 'package:flutter/material.dart';
import 'screens/radia_workstation_screen.dart';

void main() {
  runApp(const RadiaApp());
}

class RadiaApp extends StatelessWidget {
  const RadiaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UltrAI Med — Copiloto USG',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090D16),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF0B4F5E),
          secondary: Color(0xFF38BDF8),
        ),
        useMaterial3: true,
      ),
      home: const RadiaWorkstationScreen(),
    );
  }
}
