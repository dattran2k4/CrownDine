import 'package:json_annotation/json_annotation.dart';

import '../../domain/entities/profile_entity.dart';

part 'profile_response_dto.g.dart';

@JsonSerializable()
class ProfileResponseDto {
  const ProfileResponseDto({
    this.id,
    this.username,
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
    this.rewardPoints,
    this.avatarUrl,
    this.role,
    this.gender,
    this.dateOfBirth,
    this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory ProfileResponseDto.fromJson(Map<String, dynamic> json) =>
      _$ProfileResponseDtoFromJson(json);

  final int? id;
  final String? username;
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phone;
  final int? rewardPoints;
  final String? avatarUrl;
  final String? role;
  final String? gender;
  final DateTime? dateOfBirth;
  final String? status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Map<String, dynamic> toJson() => _$ProfileResponseDtoToJson(this);

  ProfileEntity toDomain() {
    return ProfileEntity(
      id: id,
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      rewardPoints: rewardPoints,
      avatarUrl: avatarUrl,
      role: role,
      gender: gender,
      dateOfBirth: dateOfBirth,
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
