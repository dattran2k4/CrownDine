abstract final class ApiConstants {
  static const String baseUrl = 'http://10.0.2.2:8080/api';

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 15);

  static const String loginEndpoint = '/auth/login';
  static const String refreshTokenEndpoint = '/auth/refresh-token';
  static const String logoutEndpoint = '/auth/logout';
}
