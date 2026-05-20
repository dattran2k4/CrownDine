import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';

class HomeSectionHeader extends StatelessWidget {
  const HomeSectionHeader({
    required this.eyebrow,
    required this.title,
    this.actionLabel,
    this.onActionPressed,
    super.key,
  });

  final String eyebrow;
  final String title;
  final String? actionLabel;
  final VoidCallback? onActionPressed;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                eyebrow.toUpperCase(),
                style: textTheme.labelSmall?.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                title,
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.4,
                ),
              ),
            ],
          ),
        ),
        if (actionLabel != null)
          TextButton(onPressed: onActionPressed, child: Text(actionLabel!)),
      ],
    );
  }
}
