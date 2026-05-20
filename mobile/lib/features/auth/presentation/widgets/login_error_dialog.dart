import 'package:flutter/material.dart';

import '../../../../core/exceptions/app_exception.dart';

Future<void> showLoginErrorDialog(BuildContext context, Object? error) {
  final message = switch (error) {
    UnauthorizedException() => 'Tên đăng nhập hoặc mật khẩu chưa chính xác.',
    AppException(:final message) => message,
    _ => 'Không thể đăng nhập. Vui lòng thử lại.',
  };

  return showDialog<void>(
    context: context,
    builder: (context) => LoginErrorDialog(message: message),
  );
}

class LoginErrorDialog extends StatelessWidget {
  const LoginErrorDialog({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Đăng nhập không thành công'),
      content: Text(message),
      actions: [
        FilledButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('OK'),
        ),
      ],
    );
  }
}
