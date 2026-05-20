abstract final class ApiConstants {
  static const String baseUrl = 'http://10.0.2.2:8080/api';

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 15);

  static const String refreshTokenHeader = 'X-Refresh-Token';

  static const String loginEndpoint = '/auth/login';
  static const String googleLoginEndpoint = '/auth/google-login';
  static const String refreshTokenEndpoint = '/auth/refresh-token';
  static const String logoutEndpoint = '/auth/logout';
  static const String registerEndpoint = '/auth/register';
  static const String profileEndpoint = '/users/profile';

  static const Set<String> publicEndpoints = {
    loginEndpoint,
    googleLoginEndpoint,
    refreshTokenEndpoint,
    registerEndpoint,
  };
}
