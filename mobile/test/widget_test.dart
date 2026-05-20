import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/app/app.dart';

void main() {
  testWidgets('CrownDine app starts', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: CrownDineApp()));

    await tester.pump();

    expect(find.text('CrownDine'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
