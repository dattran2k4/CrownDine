import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router.dart';
import '../controllers/splash_controller.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage> {
  ProviderSubscription<AsyncValue<SplashDestination>>? _splashSubscription;

  @override
  void initState() {
    super.initState();

    // Splash chỉ làm side-effect điều hướng. Listener đặt trong initState để
    // đăng ký đúng một lần, tránh build lại làm redirect nhiều lần.
    _splashSubscription = ref.listenManual(splashControllerProvider, (
      previous,
      next,
    ) {
      next.whenData((destination) {
        final route = switch (destination) {
          SplashDestination.home => AppRoute.home,
          SplashDestination.login => AppRoute.login,
        };

        if (mounted) {
          context.goNamed(route.name);
        }
      });
    });
  }

  @override
  void dispose() {
    _splashSubscription?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(splashControllerProvider);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'CrownDine',
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                const SizedBox(height: 12),
                const CircularProgressIndicator(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
