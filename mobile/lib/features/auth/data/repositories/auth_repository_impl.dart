import '../../../../core/exceptions/app_exception.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../../../core/utils/debug_log.dart';
import '../../domain/entities/auth_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../dto/login_request_dto.dart';
import '../sources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl({
    required AuthRemoteDataSource remoteDataSource,
    required SecureStorageService secureStorageService,
  }) : _remoteDataSource = remoteDataSource,
       _secureStorageService = secureStorageService;

  final AuthRemoteDataSource _remoteDataSource;
  final SecureStorageService _secureStorageService;

  @override
  Future<AuthSession> login({
    required String username,
    required String password,
  }) async {
    final tokenResponse = await _remoteDataSource.login(
      LoginRequestDto(username: username, password: password),
    );
    appDebugLog('Login token response mapped to DTO.');
    final session = tokenResponse.toDomain();

    await _secureStorageService.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );

    return session;
  }

  @override
  Future<AuthSession> refreshToken() async {
    final refreshToken = await _secureStorageService.getRefreshToken();

    if (refreshToken == null || refreshToken.isEmpty) {
      await _secureStorageService.clearTokens();
      throw const UnauthorizedException();
    }

    final tokenResponse = await _remoteDataSource.refreshToken(
      refreshToken: refreshToken,
    );
    final session = tokenResponse.toDomain();

    await _secureStorageService.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    );

    return session;
  }

  @override
  Future<AuthSession?> getSavedSession() async {
    final accessToken = await _secureStorageService.getAccessToken();
    final refreshToken = await _secureStorageService.getRefreshToken();

    if (accessToken == null ||
        accessToken.isEmpty ||
        refreshToken == null ||
        refreshToken.isEmpty) {
      return null;
    }

    return AuthSession(accessToken: accessToken, refreshToken: refreshToken);
  }

  @override
  Future<void> logout() async {
    final refreshToken = await _secureStorageService.getRefreshToken();

    try {
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _remoteDataSource.logout(refreshToken: refreshToken);
      }
    } catch (error, stackTrace) {
      appDebugLog(
        'Remote logout failed. Clearing local tokens anyway.',
        error: error,
        stackTrace: stackTrace,
      );
    } finally {
      await _secureStorageService.clearTokens();
    }
  }
}
