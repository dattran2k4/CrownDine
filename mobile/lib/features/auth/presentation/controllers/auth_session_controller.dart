import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/debug_log.dart';
import '../../domain/entities/auth_session.dart';
import '../../providers/auth_providers.dart';

final authSessionControllerProvider =
    AsyncNotifierProvider<AuthSessionController, AuthSession?>(
      AuthSessionController.new,
    );

class AuthSessionController extends AsyncNotifier<AuthSession?> {
  @override
  FutureOr<AuthSession?> build() async {
    final session = await ref.read(authRepositoryProvider).getSavedSession();

    appDebugLog(
      session?.hasTokens == true
          ? 'Auth session restored from secure storage.'
          : 'No auth session in secure storage.',
    );

    return session;
  }

  void setSession(AuthSession session) {
    state = AsyncData(session);
  }

  void clearSession() {
    state = const AsyncData(null);
  }
}
