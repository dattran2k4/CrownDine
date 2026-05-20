import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/providers/auth_providers.dart';
import '../../../../../core/utils/debug_log.dart';

final splashControllerProvider =
    AsyncNotifierProvider<SplashController, SplashDestination>(
      SplashController.new,
    );

enum SplashDestination { login, home }

class SplashController extends AsyncNotifier<SplashDestination> {
  @override
  FutureOr<SplashDestination> build() async {
    try {
      final session = await ref.read(authRepositoryProvider).getSavedSession();

      if (session?.hasTokens == true) {
        appDebugLog('Saved session found. Redirecting to home.');
        return SplashDestination.home;
      }
    } catch (error, stackTrace) {
      appDebugLog(
        'Unable to read saved session. Redirecting to login.',
        error: error,
        stackTrace: stackTrace,
      );
    }

    appDebugLog('No saved session found. Redirecting to login.');
    return SplashDestination.login;
  }
}
