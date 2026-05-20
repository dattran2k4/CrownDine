import 'package:dio/dio.dart';

import '../exceptions/app_exception.dart';
import '../utils/debug_log.dart';

Future<T> runApiCall<T>(Future<T> Function() action) async {
  try {
    return await action();
  } on DioException catch (error) {
    // ErrorInterceptor đặt AppException vào DioException.error. Helper này
    // bóc lỗi ra ngay tại data layer để repository không phải biết về Dio.
    final appException = error.error;

    if (appException is AppException) {
      appDebugLog(
        'API call unwrapped ${appException.runtimeType}.',
        error: appException,
      );
      throw appException;
    }

    appDebugLog(
      'API call received DioException without AppException.',
      error: error,
    );

    throw UnknownException(
      message: error.message ?? 'Something went wrong. Please try again.',
      details: error,
    );
  }
}
