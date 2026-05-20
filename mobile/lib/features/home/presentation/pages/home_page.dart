import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/controllers/logout_controller.dart';
import '../widgets/home_featured_dishes_section.dart';
import '../widgets/home_hero_section.dart';
import '../widgets/home_quick_actions_section.dart';
import '../widgets/home_story_section.dart';
import '../widgets/home_visit_section.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logoutState = ref.watch(logoutControllerProvider);
    final isLoggingOut = logoutState.isLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('CrownDine'),
        actions: [
          // Tạm để logout ở Home. Khi có Profile tab, nút này sẽ chuyển sang Profile.
          TextButton(
            onPressed: isLoggingOut
                ? null
                : () => ref.read(logoutControllerProvider.notifier).logout(),
            child: isLoggingOut
                ? const SizedBox.square(
                    dimension: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Sign out'),
          ),
        ],
      ),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
              sliver: SliverList(
                delegate: SliverChildListDelegate.fixed([
                  HomeHeroSection(
                    onReservePressed: () => _showComingSoon(
                      context,
                      'Tab Reservation sẽ xử lý đặt bàn.',
                    ),
                    onMenuPressed: () => _showComingSoon(
                      context,
                      'Tab Menu sẽ có search, filter và category.',
                    ),
                  ),
                  const SizedBox(height: 18),
                  HomeQuickActionsSection(
                    onMenuTap: () => _showComingSoon(
                      context,
                      'Mình sẽ làm tab Menu sau Home.',
                    ),
                    onReserveTap: () => _showComingSoon(
                      context,
                      'Mình sẽ làm tab Reservation sau.',
                    ),
                  ),
                  const SizedBox(height: 28),
                  HomeFeaturedDishesSection(
                    onViewMenuPressed: () => _showComingSoon(
                      context,
                      'Tab Menu sẽ được làm ở bước tiếp theo.',
                    ),
                  ),
                  const SizedBox(height: 28),
                  const HomeStorySection(),
                  const SizedBox(height: 28),
                  const HomeVisitSection(),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static void _showComingSoon(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }
}
