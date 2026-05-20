import 'package:dio/dio.dart';

import '../../../../core/api/api_call_handler.dart';
import '../../../../core/api/api_response.dart';
import '../../../../core/constants/api_constants.dart';
import '../dto/profile_response_dto.dart';

abstract interface class ProfileRemoteDataSource {
  Future<ProfileResponseDto> getProfile();
}

class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  const ProfileRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<ProfileResponseDto> getProfile() {
    return runApiCall(() async {
      final response = await _dio.get<Map<String, dynamic>>(
        ApiConstants.profileEndpoint,
      );

      final apiResponse = ApiResponse<ProfileResponseDto>.fromJson(
        response.data ?? const {},
        fromJsonT: (json) =>
            ProfileResponseDto.fromJson(json as Map<String, dynamic>),
      );

      return apiResponse.data ?? const ProfileResponseDto();
    });
  }
}
