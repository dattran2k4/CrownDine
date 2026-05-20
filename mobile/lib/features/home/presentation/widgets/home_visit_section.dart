import 'package:flutter/material.dart';

import 'home_info_tile.dart';
import 'home_section_header.dart';

class HomeVisitSection extends StatelessWidget {
  const HomeVisitSection({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        HomeSectionHeader(eyebrow: 'Visit us', title: 'Thông tin nhà hàng'),
        SizedBox(height: 14),
        HomeInfoTile(
          icon: Icons.schedule_rounded,
          title: 'Mở cửa hằng ngày',
          subtitle: '10:00 - 22:00',
        ),
        SizedBox(height: 10),
        HomeInfoTile(
          icon: Icons.location_on_rounded,
          title: 'Địa chỉ',
          subtitle: '123 Gourmet Street, Da Nang',
        ),
        SizedBox(height: 10),
        HomeInfoTile(
          icon: Icons.call_rounded,
          title: 'Hotline đặt bàn',
          subtitle: '+1 (555) 123-4567',
        ),
      ],
    );
  }
}
