import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/presentation/controllers/logout_controller.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final logoutState = ref.watch(logoutControllerProvider);
    final isLoggingOut = logoutState.isLoading;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(
                Icons.person_rounded,
                size: 64,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 16),
              Text(
                'Profile',
                textAlign: TextAlign.center,
                style: textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Thông tin tài khoản, lịch sử điểm/voucher và cài đặt sẽ được làm ở đây.',
                textAlign: TextAlign.center,
                style: textTheme.bodyMedium,
              ),
              const Spacer(),
              FilledButton(
                onPressed: isLoggingOut
                    ? null
                    : () =>
                          ref.read(logoutControllerProvider.notifier).logout(),
                child: isLoggingOut
                    ? SizedBox.square(
                        dimension: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Theme.of(context).colorScheme.onPrimary,
                        ),
                      )
                    : const Text('Sign out'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
