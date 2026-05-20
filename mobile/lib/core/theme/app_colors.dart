import 'package:flutter/material.dart';

abstract final class AppColors {
  static const Color primary = Color(0xFFFF6B35);
  static const Color primaryForeground = Color(0xFFFFFFFF);

  static const Color background = Color(0xFFFCFAF4);
  static const Color foreground = Color(0xFF2D211D);

  static const Color secondary = Color(0xFF31231F);
  static const Color secondaryForeground = Color(0xFFFCFAF4);

  static const Color muted = Color(0xFFF3F1F8);
  static const Color mutedForeground = Color(0xFF6B6B80);

  static const Color card = Color(0xFFFFFFFF);
  static const Color cardForeground = Color(0xFF261E22);

  static const Color border = Color(0xFFEDE7DC);
  static const Color input = Color(0xFFF4F1F1);
  static const Color ring = primary;

  static const Color destructive = Color(0xFFEF4444);
  static const Color destructiveForeground = Color(0xFFFFFFFF);

  static const Color warning = Color(0xFFF59E0B);
  static const Color warningForeground = Color(0xFFFFFFFF);

  static const Color online = Color(0xFF00FF55);
  static const Color offline = Color(0xFFB3B3B3);

  static const List<Color> chart = [
    Color(0xFFFF6B35),
    Color(0xFFD98A20),
    Color(0xFFB86B3A),
    Color(0xFFE35D35),
    Color(0xFFC7792F),
  ];
}
