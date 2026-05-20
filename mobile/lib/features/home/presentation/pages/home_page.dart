import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router.dart';
import '../widgets/home_featured_dishes_section.dart';
import '../widgets/home_hero_section.dart';
import '../widgets/home_quick_actions_section.dart';
import '../widgets/home_story_section.dart';
import '../widgets/home_visit_section.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('CrownDine')),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
              sliver: SliverList(
                delegate: SliverChildListDelegate.fixed([
                  HomeHeroSection(
                    onReservePressed: () => context.go(AppRoute.reserve.path),
                    onMenuPressed: () => context.go(AppRoute.menu.path),
                  ),
                  const SizedBox(height: 18),
                  HomeQuickActionsSection(
                    onMenuTap: () => context.go(AppRoute.menu.path),
                    onReserveTap: () => context.go(AppRoute.reserve.path),
                  ),
                  const SizedBox(height: 28),
                  HomeFeaturedDishesSection(
                    onViewMenuPressed: () => context.go(AppRoute.menu.path),
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
}
