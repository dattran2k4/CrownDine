import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/controllers/auth_session_controller.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/splash/presentation/pages/splash_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authSessionControllerProvider);

  return GoRouter(
    initialLocation: AppRoute.splash.path,
    redirect: (context, state) {
      final currentPath = state.uri.path;
      final isSplashRoute = currentPath == AppRoute.splash.path;
      final isLoginRoute = currentPath == AppRoute.login.path;
      final session = switch (authState) {
        AsyncData(:final value) => value,
        _ => null,
      };
      final isLoggedIn = session?.hasTokens == true;

      // Khi app đang đọc token trong secure storage, giữ user ở Splash.
      if (authState.isLoading) {
        return isSplashRoute ? null : AppRoute.splash.path;
      }

      // Nếu chưa đăng nhập, mọi route protected sẽ bị đưa về Login.
      if (!isLoggedIn) {
        return isLoginRoute ? null : AppRoute.login.path;
      }

      // Tới đây chắc chắn đã đăng nhập. Nếu user đang ở Splash/Login thì đưa
      // về Home, vì hai route này chỉ dành cho lúc chưa có session.
      if (isSplashRoute || isLoginRoute) {
        return AppRoute.home.path;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: AppRoute.splash.path,
        name: AppRoute.splash.name,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: AppRoute.login.path,
        name: AppRoute.login.name,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoute.home.path,
        name: AppRoute.home.name,
        builder: (context, state) => const HomePage(),
      ),
    ],
  );
});

enum AppRoute {
  splash('/splash'),
  login('/login'),
  home('/home');

  const AppRoute(this.path);

  final String path;
}
