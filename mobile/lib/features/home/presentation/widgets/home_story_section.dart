import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import 'home_stat_card.dart';

class HomeStorySection extends StatelessWidget {
  const HomeStorySection({super.key});

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Our Story',
            style: textTheme.labelLarge?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Từ đam mê đến bàn ăn',
            style: textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'CrownDine mang tinh thần fine dining gần gũi hơn: món ăn được chuẩn bị kỹ, không gian ấm, và mỗi bàn ăn là một câu chuyện đáng nhớ.',
            style: textTheme.bodyMedium?.copyWith(
              color: AppColors.mutedForeground,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 18),
          const Row(
            children: [
              Expanded(
                child: HomeStatCard(value: '15+', label: 'Năm kinh nghiệm'),
              ),
              SizedBox(width: 10),
              Expanded(
                child: HomeStatCard(value: '50K+', label: 'Khách hài lòng'),
              ),
              SizedBox(width: 10),
              Expanded(
                child: HomeStatCard(value: '3', label: 'Sao Michelin'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
