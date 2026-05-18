import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

final appRouter = GoRouter(
  initialLocation: AppRoute.home.path,
  routes: [
    GoRoute(
      path: AppRoute.home.path,
      name: AppRoute.home.name,
      builder: (context, state) => const _HomePage(),
    ),
  ],
);

enum AppRoute {
  home('/');

  const AppRoute(this.path);

  final String path;
}

class _HomePage extends StatelessWidget {
  const _HomePage();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('CrownDine')));
  }
}
