import '../entities/auth_session.dart';

abstract interface class AuthRepository {
  Future<AuthSession> login({
    required String username,
    required String password,
  });

  Future<AuthSession> refreshToken();

  Future<AuthSession?> getSavedSession();

  Future<void> logout();
}
