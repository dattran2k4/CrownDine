import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/debug_log.dart';
import '../../providers/auth_providers.dart';

final loginControllerProvider = AsyncNotifierProvider<LoginController, void>(
  LoginController.new,
);

class LoginController extends AsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<void> login({
    required String username,
    required String password,
  }) async {
    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      await ref
          .read(authRepositoryProvider)
          .login(username: username.trim(), password: password);

      appDebugLog('Login succeeded for username=${username.trim()}');
    });

    if (state.hasError) {
      appDebugLog(
        'Login failed in controller.',
        error: state.error,
        stackTrace: state.stackTrace,
      );
    }
  }
}
