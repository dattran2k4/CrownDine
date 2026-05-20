import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../controllers/profile_controller.dart';
import '../widgets/profile_action_tile.dart';
import '../widgets/profile_header_card.dart';
import '../widgets/profile_logout_button.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SafeArea(
        child: profileState.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stackTrace) => _ProfileErrorView(
            onRetry: () =>
                ref.read(profileControllerProvider.notifier).refreshProfile(),
          ),
          data: (profile) => RefreshIndicator(
            onRefresh: () =>
                ref.read(profileControllerProvider.notifier).refreshProfile(),
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
              children: [
                ProfileHeaderCard(profile: profile),
                const SizedBox(height: 24),
                Text(
                  'Tài khoản của bạn',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(height: 14),
                ProfileActionTile(
                  icon: Icons.history_rounded,
                  title: 'Lịch sử đặt bàn',
                  subtitle: 'Xem reservation và đơn hàng đã dùng.',
                  onTap: () => _showComingSoon(
                    context,
                    'Mục lịch sử đặt bàn sẽ được làm ở bước sau.',
                  ),
                ),
                const SizedBox(height: 10),
                ProfileActionTile(
                  icon: Icons.confirmation_number_rounded,
                  title: 'Voucher của tôi',
                  subtitle: 'Danh sách voucher đang có và sắp hết hạn.',
                  onTap: () => _showComingSoon(
                    context,
                    'Mục voucher sẽ được làm ở bước sau.',
                  ),
                ),
                const SizedBox(height: 10),
                ProfileActionTile(
                  icon: Icons.stars_rounded,
                  title: 'Tích điểm đổi voucher',
                  subtitle: 'Theo dõi điểm thưởng và đổi ưu đãi.',
                  onTap: () => _showComingSoon(
                    context,
                    'Mục tích điểm đổi voucher sẽ được làm ở bước sau.',
                  ),
                ),
                const SizedBox(height: 10),
                ProfileActionTile(
                  icon: Icons.lock_rounded,
                  title: 'Tài khoản & bảo mật',
                  subtitle: 'Thông tin cá nhân, mật khẩu và email.',
                  onTap: () => _showComingSoon(
                    context,
                    'Mục tài khoản & bảo mật sẽ được làm ở bước sau.',
                  ),
                ),
                const SizedBox(height: 24),
                const ProfileLogoutButton(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  static void _showComingSoon(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }
}

class _ProfileErrorView extends StatelessWidget {
  const _ProfileErrorView({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline_rounded,
              color: AppColors.destructive,
              size: 56,
            ),
            const SizedBox(height: 16),
            Text(
              'Không tải được profile',
              style: textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Vui lòng kiểm tra kết nối hoặc thử lại sau.',
              textAlign: TextAlign.center,
              style: textTheme.bodyMedium?.copyWith(
                color: AppColors.mutedForeground,
              ),
            ),
            const SizedBox(height: 20),
            FilledButton(onPressed: onRetry, child: const Text('Thử lại')),
          ],
        ),
      ),
    );
  }
}
