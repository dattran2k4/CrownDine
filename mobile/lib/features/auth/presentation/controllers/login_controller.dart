import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/utils/debug_log.dart';
import '../../providers/auth_providers.dart';
import 'auth_session_controller.dart';

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
    final trimmedUsername = username.trim();

    if (trimmedUsername.isEmpty || password.isEmpty) {
      state = AsyncError(
        const ValidationException(
          message: 'Vui lòng nhập tên đăng nhập và mật khẩu.',
        ),
        StackTrace.current,
      );
      return;
    }

    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      final session = await ref
          .read(authRepositoryProvider)
          .login(username: trimmedUsername, password: password);
      ref.read(authSessionControllerProvider.notifier).setSession(session);

      appDebugLog('Login succeeded for username=$trimmedUsername');
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
