import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../app/router.dart';
import '../controllers/login_controller.dart';
import '../widgets/login_error_dialog.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();

  ProviderSubscription<AsyncValue<void>>? _loginSubscription;
  bool _isLoginErrorDialogOpen = false;

  @override
  void initState() {
    super.initState();

    // ref.listen tạo side-effect như show dialog hoặc điều hướng. Không đặt nó
    // trong build(), vì build có thể chạy nhiều lần và dễ đăng ký nhiều listener.
    _loginSubscription = ref.listenManual(loginControllerProvider, (
      previous,
      next,
    ) {
      if (next.hasError) {
        _showLoginError(next.error);
        return;
      }

      if (previous?.isLoading == true && next is AsyncData<void>) {
        context.goNamed(AppRoute.home.name);
      }
    });
  }

  @override
  void dispose() {
    _loginSubscription?.close();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Controller trả về AsyncValue: loading thì khóa form, error thì hiện modal,
    // success thì điều hướng sang Home.
    final loginState = ref.watch(loginControllerProvider);
    final isLoading = loginState.isLoading;

    return Scaffold(
      appBar: AppBar(title: const Text('Sign in')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Welcome back',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Sign in to continue managing CrownDine.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _usernameController,
                enabled: !isLoading,
                // Gợi ý hệ điều hành mở bàn phím phù hợp cho email/username.
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Username',
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _passwordController,
                enabled: !isLoading,
                obscureText: true,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _submit(),
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Password',
                ),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: isLoading ? null : _submit,
                child: isLoading
                    ? const SizedBox.square(
                        dimension: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Sign in'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    ref
        .read(loginControllerProvider.notifier)
        .login(
          username: _usernameController.text,
          password: _passwordController.text,
        );
  }

  Future<void> _showLoginError(Object? error) async {
    // Một lỗi có thể làm widget rebuild hoặc listener nhận lại state cũ. Cờ này
    // đảm bảo chỉ có một dialog login error đang mở tại một thời điểm.
    if (_isLoginErrorDialogOpen) {
      return;
    }

    _isLoginErrorDialogOpen = true;
    await showLoginErrorDialog(context, error);
    _isLoginErrorDialogOpen = false;
  }
}
