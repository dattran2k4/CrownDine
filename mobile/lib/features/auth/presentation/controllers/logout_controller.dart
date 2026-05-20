import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/debug_log.dart';
import '../../providers/auth_providers.dart';
import 'auth_session_controller.dart';

final logoutControllerProvider = AsyncNotifierProvider<LogoutController, void>(
  LogoutController.new,
);

class LogoutController extends AsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> logout() async {
    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      await ref.read(authRepositoryProvider).logout();
      ref.read(authSessionControllerProvider.notifier).clearSession();
      appDebugLog('Logout succeeded.');
    });

    if (state.hasError) {
      appDebugLog(
        'Logout failed.',
        error: state.error,
        stackTrace: state.stackTrace,
      );
    }
  }
}
