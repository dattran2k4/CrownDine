import 'package:flutter/material.dart';

import 'router.dart';

class CrownDineApp extends StatelessWidget {
  const CrownDineApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'CrownDine',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFB3261E)),
        useMaterial3: true,
      ),
      routerConfig: appRouter,
    );
  }
}
