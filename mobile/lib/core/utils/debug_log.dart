import 'package:flutter/foundation.dart';

void appDebugLog(String message, {Object? error, StackTrace? stackTrace}) {
  if (!kDebugMode) {
    return;
  }

  debugPrint('[CrownDine] $message');

  if (error != null) {
    debugPrint('[CrownDine] error: $error');
  }

  if (stackTrace != null) {
    debugPrint('[CrownDine] stackTrace: $stackTrace');
  }
}
