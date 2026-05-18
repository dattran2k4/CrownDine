class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.username,
  });

  final String accessToken;
  final String refreshToken;
  final String username;

  bool get hasTokens => accessToken.isNotEmpty && refreshToken.isNotEmpty;
}
