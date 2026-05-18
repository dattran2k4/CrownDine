import 'package:dio/dio.dart';

import '../constants/api_constants.dart';

class DioClient {
  DioClient({List<Interceptor> interceptors = const []})
    : dio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: ApiConstants.connectTimeout,
          receiveTimeout: ApiConstants.receiveTimeout,
          sendTimeout: ApiConstants.sendTimeout,
          contentType: Headers.jsonContentType,
          responseType: ResponseType.json,
          headers: const {Headers.acceptHeader: Headers.jsonContentType},
        ),
      ) {
    dio.interceptors.addAll(interceptors);
  }

  final Dio dio;
}
