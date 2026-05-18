sealed class AppException implements Exception {
  const AppException({
    required this.message,
    this.code,
    this.statusCode,
    this.details,
  });

  final String message;
  final String? code;
  final int? statusCode;
  final Object? details;

  @override
  String toString() {
    final buffer = StringBuffer('$runtimeType: $message');

    if (code != null) {
      buffer.write(' (code: $code)');
    }

    if (statusCode != null) {
      buffer.write(' (status: $statusCode)');
    }

    return buffer.toString();
  }
}

final class NetworkException extends AppException {
  const NetworkException({
    super.message = 'Unable to connect. Please check your connection.',
    super.code,
    super.statusCode,
    super.details,
  });
}

final class UnauthorizedException extends AppException {
  const UnauthorizedException({
    super.message = 'Your session has expired. Please sign in again.',
    super.code,
    super.statusCode = 401,
    super.details,
  });
}

final class ForbiddenException extends AppException {
  const ForbiddenException({
    super.message = 'You do not have permission to perform this action.',
    super.code,
    super.statusCode = 403,
    super.details,
  });
}

final class NotFoundException extends AppException {
  const NotFoundException({
    super.message = 'The requested resource was not found.',
    super.code,
    super.statusCode = 404,
    super.details,
  });
}

final class ValidationException extends AppException {
  const ValidationException({
    super.message = 'Please check the information and try again.',
    super.code,
    super.statusCode = 422,
    super.details,
  });
}

final class ServerException extends AppException {
  const ServerException({
    super.message = 'Something went wrong on our side. Please try again later.',
    super.code,
    super.statusCode,
    super.details,
  });
}

final class UnknownException extends AppException {
  const UnknownException({
    super.message = 'Something went wrong. Please try again.',
    super.code,
    super.statusCode,
    super.details,
  });
}
