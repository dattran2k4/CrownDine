import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../core/theme/app_colors.dart';

class CustomerShell extends StatelessWidget {
  const CustomerShell({required this.navigationShell, super.key});

  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        indicatorColor: AppColors.primary.withValues(alpha: 0.12),
        onDestinationSelected: _goToBranch,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.restaurant_menu_outlined),
            selectedIcon: Icon(Icons.restaurant_menu_rounded),
            label: 'Menu',
          ),
          NavigationDestination(
            icon: Icon(Icons.event_seat_outlined),
            selectedIcon: Icon(Icons.event_seat_rounded),
            label: 'Reserve',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  void _goToBranch(int index) {
    navigationShell.goBranch(
      index,
      // Bấm lại tab hiện tại thì quay về route gốc của tab đó.
      initialLocation: index == navigationShell.currentIndex,
    );
  }
}
