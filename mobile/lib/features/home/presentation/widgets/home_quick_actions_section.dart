import 'package:flutter/material.dart';

import 'home_quick_action_card.dart';

class HomeQuickActionsSection extends StatelessWidget {
  const HomeQuickActionsSection({
    required this.onMenuTap,
    required this.onReserveTap,
    super.key,
  });

  final VoidCallback onMenuTap;
  final VoidCallback onReserveTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: HomeQuickActionCard(
            icon: Icons.restaurant_menu_rounded,
            title: 'Menu',
            subtitle: 'Khám phá món ngon',
            onTap: onMenuTap,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: HomeQuickActionCard(
            icon: Icons.event_seat_rounded,
            title: 'Đặt bàn',
            subtitle: 'Giữ chỗ nhanh',
            onTap: onReserveTap,
          ),
        ),
      ],
    );
  }
}
