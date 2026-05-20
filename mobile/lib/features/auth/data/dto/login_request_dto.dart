import 'package:json_annotation/json_annotation.dart';

part 'login_request_dto.g.dart';
//dart run build_runner build
@JsonSerializable()
class LoginRequestDto {
  const LoginRequestDto({required this.username, required this.password});

  factory LoginRequestDto.fromJson(Map<String, dynamic> json) =>
      _$LoginRequestDtoFromJson(json);

  final String username;
  final String password;

  Map<String, dynamic> toJson() => _$LoginRequestDtoToJson(this);
}
