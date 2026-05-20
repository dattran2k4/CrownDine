import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/controllers/logout_controller.dart';

class ProfileLogoutButton extends ConsumerWidget {
  const ProfileLogoutButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logoutState = ref.watch(logoutControllerProvider);
    final isLoggingOut = logoutState.isLoading;

    return FilledButton(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.destructive,
        foregroundColor: AppColors.destructiveForeground,
      ),
      onPressed: isLoggingOut
          ? null
          : () => ref.read(logoutControllerProvider.notifier).logout(),
      child: isLoggingOut
          ? SizedBox.square(
              dimension: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Theme.of(context).colorScheme.onPrimary,
              ),
            )
          : const Text('Sign out'),
    );
  }
}
