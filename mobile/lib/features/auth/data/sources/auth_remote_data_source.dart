import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../dto/login_request_dto.dart';
import '../dto/token_response_dto.dart';

class AuthRemoteDataSource {
  const AuthRemoteDataSource(this._dio);

  final Dio _dio;

  Future<TokenResponseDto> login(LoginRequestDto request) async {
    final response = await _dio.post<Map<String, dynamic>>(
      ApiConstants.loginEndpoint,
      data: request.toJson(),
    );

    return TokenResponseDto.fromJson(response.data ?? const {});
  }

  Future<TokenResponseDto> refreshToken() async {
    final response = await _dio.post<Map<String, dynamic>>(
      ApiConstants.refreshTokenEndpoint,
    );

    return TokenResponseDto.fromJson(response.data ?? const {});
  }

  Future<void> logout() async {
    await _dio.post<void>(ApiConstants.logoutEndpoint);
  }
}
