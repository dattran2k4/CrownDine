import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import 'featured_dish_card.dart';
import 'home_section_header.dart';

class HomeFeaturedDishesSection extends StatelessWidget {
  const HomeFeaturedDishesSection({required this.onViewMenuPressed, super.key});

  final VoidCallback onViewMenuPressed;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        HomeSectionHeader(
          eyebrow: 'Signature picks',
          title: 'Món nổi bật hôm nay',
          actionLabel: 'Xem menu',
          onActionPressed: onViewMenuPressed,
        ),
        const SizedBox(height: 14),
        const FeaturedDishCard(
          accentColor: AppColors.primary,
          name: 'Truffle Beef Steak',
          description: 'Bò áp chảo, sốt nấm truffle, rau củ nướng theo mùa.',
          price: '420.000đ',
        ),
        const SizedBox(height: 12),
        const FeaturedDishCard(
          accentColor: AppColors.warning,
          name: 'Golden Seafood Pasta',
          description: 'Pasta hải sản sốt kem nghệ tây, vị béo nhẹ và thơm.',
          price: '260.000đ',
        ),
        const SizedBox(height: 12),
        const FeaturedDishCard(
          accentColor: Color(0xFFB86B3A),
          name: 'Chef Tasting Combo',
          description: 'Combo trải nghiệm các món đặc trưng được chef chọn.',
          price: '680.000đ',
        ),
      ],
    );
  }
}
