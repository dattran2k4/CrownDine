import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/auth_session.dart';

part 'token_response_dto.g.dart';
//dart run build_runner build
@JsonSerializable()
class TokenResponseDto {
  const TokenResponseDto({
    required this.accessToken,
    required this.refreshToken,
    this.username,
  });

  factory TokenResponseDto.fromJson(Map<String, dynamic> json) =>
      _$TokenResponseDtoFromJson(json);

  final String accessToken;

  final String refreshToken;

  final String? username;

  Map<String, dynamic> toJson() => _$TokenResponseDtoToJson(this);

  AuthSession toDomain() {
    return AuthSession(
      accessToken: accessToken,
      refreshToken: refreshToken,
      username: username,
    );
  }
}
