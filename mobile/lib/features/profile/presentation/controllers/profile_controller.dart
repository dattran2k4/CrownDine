import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/utils/debug_log.dart';
import '../../domain/entities/profile_entity.dart';
import '../../providers/profile_providers.dart';

final profileControllerProvider =
    AsyncNotifierProvider<ProfileController, ProfileEntity>(
      ProfileController.new,
    );

class ProfileController extends AsyncNotifier<ProfileEntity> {
  @override
  FutureOr<ProfileEntity> build() {
    return ref.read(profileRepositoryProvider).getProfile();
  }

  Future<void> refreshProfile() async {
    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      final profile = await ref.read(profileRepositoryProvider).getProfile();
      appDebugLog('Profile refreshed for username=${profile.username}');
      return profile;
    });
  }
}
