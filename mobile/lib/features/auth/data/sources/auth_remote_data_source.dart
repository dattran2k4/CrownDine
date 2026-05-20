import 'package:dio/dio.dart';

import '../../../../core/api/api_call_handler.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/utils/debug_log.dart';
import '../dto/login_request_dto.dart';
import '../dto/token_response_dto.dart';

abstract interface class AuthRemoteDataSource {
  Future<TokenResponseDto> login(LoginRequestDto request);

  Future<TokenResponseDto> refreshToken({required String refreshToken});

  Future<void> logout({required String refreshToken});
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  const AuthRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<TokenResponseDto> login(LoginRequestDto request) async {
    return runApiCall(() async {
      appDebugLog('Calling login endpoint for username=${request.username}');

      final response = await _dio.post<Map<String, dynamic>>(
        ApiConstants.loginEndpoint,
        data: request.toJson(),
      );

      appDebugLog(
        'Login endpoint responded. '
        'status=${response.statusCode}, '
        'dataKeys=${response.data?.keys.toList()}',
      );

      return TokenResponseDto.fromJson(response.data ?? const {});
    });
  }

  @override
  Future<TokenResponseDto> refreshToken({required String refreshToken}) async {
    return runApiCall(() async {
      final response = await _dio.post<Map<String, dynamic>>(
        ApiConstants.refreshTokenEndpoint,
        options: Options(
          headers: {ApiConstants.refreshTokenHeader: refreshToken},
        ),
      );

      return TokenResponseDto.fromJson(response.data ?? const {});
    });
  }

  @override
  Future<void> logout({required String refreshToken}) async {
    return runApiCall(() async {
      await _dio.post<void>(
        ApiConstants.logoutEndpoint,
        options: Options(
          headers: {ApiConstants.refreshTokenHeader: refreshToken},
        ),
      );
    });
  }
}
