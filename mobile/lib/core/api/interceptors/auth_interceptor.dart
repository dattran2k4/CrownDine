import 'package:dio/dio.dart';

import '../../constants/api_constants.dart';
import '../../storage/secure_storage_service.dart';

class AuthInterceptor extends Interceptor {
  const AuthInterceptor(this._secureStorageService);

  final SecureStorageService _secureStorageService;

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler,) async {
    if (_isPublicEndpoint(options.path)) {
      return handler.next(options);
    }

    final accessToken = await _secureStorageService.getAccessToken();

    if (accessToken != null && accessToken.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }

    return handler.next(options);
  }

  bool _isPublicEndpoint(String path) {
    return ApiConstants.publicEndpoints.any(path.endsWith);
  }
}
