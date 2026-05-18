import 'package:dio/dio.dart';

import '../../exceptions/app_exception.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    handler.reject(_toAppException(err));
  }

  DioException _toAppException(DioException err) {
    final appException = switch (err.type) {
      DioExceptionType.connectionTimeout ||
      DioExceptionType.sendTimeout ||
      DioExceptionType.receiveTimeout ||
      DioExceptionType.connectionError => NetworkException(
        statusCode: err.response?.statusCode,
        details: err,
      ),
      DioExceptionType.badResponse => _fromResponse(err),
      DioExceptionType.cancel => UnknownException(
        message: 'The request was cancelled.',
        statusCode: err.response?.statusCode,
        details: err,
      ),
      DioExceptionType.badCertificate || DioExceptionType.unknown =>
        UnknownException(statusCode: err.response?.statusCode, details: err),
    };

    return err.copyWith(error: appException);
  }

  AppException _fromResponse(DioException err) {
    final statusCode = err.response?.statusCode;
    final errorBody = _ErrorBody.from(err.response?.data);
    final message = errorBody.message;
    final code = errorBody.code;

    if (statusCode != null && statusCode >= 500 && statusCode < 600) {
      return ServerException(
        message:
            message ??
            'Something went wrong on our side. Please try again later.',
        code: code,
        statusCode: statusCode,
        details: err,
      );
    }

    return switch (statusCode) {
      400 || 422 => ValidationException(
        message: message ?? 'Please check the information and try again.',
        code: code,
        statusCode: statusCode,
        details: err,
      ),
      401 => UnauthorizedException(
        message: message ?? 'Your session has expired. Please sign in again.',
        code: code,
        details: err,
      ),
      403 => ForbiddenException(
        message:
            message ?? 'You do not have permission to perform this action.',
        code: code,
        details: err,
      ),
      404 => NotFoundException(
        message: message ?? 'The requested resource was not found.',
        code: code,
        details: err,
      ),
      _ => UnknownException(
        message: message ?? 'Something went wrong. Please try again.',
        code: code,
        statusCode: statusCode,
        details: err,
      ),
    };
  }
}

class _ErrorBody {
  const _ErrorBody({this.code, this.message});

  factory _ErrorBody.from(Object? data) {
    if (data case {
      'code': final Object? code,
      'message': final Object? message,
    }) {
      return _ErrorBody(code: code?.toString(), message: message?.toString());
    }

    if (data case {
      'errorCode': final Object? code,
      'errorMessage': final Object? message,
    }) {
      return _ErrorBody(code: code?.toString(), message: message?.toString());
    }

    if (data case {
      'error': final Object? code,
      'message': final Object? message,
    }) {
      return _ErrorBody(code: code?.toString(), message: message?.toString());
    }

    if (data case {'error': final Object? message}) {
      return _ErrorBody(message: message?.toString());
    }

    return const _ErrorBody();
  }

  final String? code;
  final String? message;
}
