import 'package:equatable/equatable.dart';

class ProfileEntity extends Equatable {
  const ProfileEntity({
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

  String get displayName {
    final fullName = [
      firstName?.trim(),
      lastName?.trim(),
    ].where((part) => part != null && part.isNotEmpty).join(' ');

    if (fullName.isNotEmpty) {
      return fullName;
    }

    return username?.trim().isNotEmpty == true ? username!.trim() : 'Guest';
  }

  @override
  List<Object?> get props => [
    id,
    username,
    firstName,
    lastName,
    email,
    phone,
    rewardPoints,
    avatarUrl,
    role,
    gender,
    dateOfBirth,
    status,
    createdAt,
    updatedAt,
  ];
}
