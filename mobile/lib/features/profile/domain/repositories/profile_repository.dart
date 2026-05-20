import '../entities/profile_entity.dart';

abstract interface class ProfileRepository {
  Future<ProfileEntity> getProfile();
}
