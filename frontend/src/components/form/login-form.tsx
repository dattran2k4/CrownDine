import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import path from '@/constants/path'
import { signinSchema, type SigninFormValues } from '@/utils/auth.schema'
import { useLogin } from '@/hooks/useLogin'
import { isAxiosUnauthorizedError } from '@/utils/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import type { ErrorResponse } from '@/types/utils.type'
import { toast } from 'sonner'
import { GoogleLogin } from '@react-oauth/google'
import { useGoogleLogin } from '@/hooks/useGoogleLogin'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema)
  })

  const loginMutation = useLogin()
  const googleLoginMutation = useGoogleLogin()

  const handleGoogleLoginSuccess = async (credential: string) => {
    try {
      await googleLoginMutation.mutateAsync(credential)
      toast.success('Đăng nhập Google thành công!')

      const roles = useAuthStore.getState().roles
      if (roles.includes('ADMIN')) {
        navigate('/admin')
      } else if (roles.includes('STAFF')) {
        navigate('/staff')
      } else {
        navigate(path.home)
      }
    } catch (error) {
      console.error('Google Login Mutation Failed:', error)
      toast.error('Đăng nhập Google thất bại!')
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await loginMutation.mutateAsync(data)
      toast.success('Đăng nhập thành công!')

      const roles = useAuthStore.getState().roles
      if (roles.includes('ADMIN')) {
        navigate('/admin')
      } else if (roles.includes('STAFF')) {
        navigate('/staff')
      } else {
        navigate(path.home)
        console.log('Logged in user has no role?')
      }
    } catch (error) {
      console.error('Login Mutation Failed WITH ERROR:', error)
      if (isAxiosUnauthorizedError<ErrorResponse>(error)) {
        const serverMessage = error.response?.data?.message
        setError('root', {
          type: 'server',
          message: serverMessage
        })
      }
    }
  })

  return (
    <div className={cn('login-form flex flex-col gap-5', className)} {...props}>
      <Card className='login-form-card border-border bg-card overflow-hidden rounded-xl border p-0 shadow-lg'>
        <CardContent className='p-0'>
          <form className='p-5 sm:p-6' onSubmit={onSubmit}>
            <div className='flex flex-col gap-5'>
              {/* Header - Logo & title */}
              <div className='flex flex-col items-center gap-2 text-center'>
                <Link
                  to={path.home}
                  className='focus-visible:ring-ring mx-auto block w-fit rounded-md text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                >
                  <img src='/logo.png' alt='CrownDine' className='h-10 w-auto object-contain' />
                </Link>
                <h1 className='text-foreground text-2xl font-bold tracking-tight'>CrownDine</h1>
                <p className='text-muted-foreground text-sm text-balance'>Chào mừng bạn trở lại.</p>
              </div>

              {/* Username */}
              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='username' className='text-sm font-medium'>
                  Tên đăng nhập
                </Label>
                <Input
                  type='text'
                  id='username'
                  placeholder='Nhập tên đăng nhập'
                  className='border-input h-10 rounded-lg'
                  autoComplete='username'
                  {...register('username')}
                />
                {errors.username && (
                  <p className='text-destructive mt-1 text-xs wrap-break-word'>{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='password' className='text-sm font-medium'>
                  Mật khẩu
                </Label>
                <Input
                  type='password'
                  id='password'
                  placeholder='Nhập mật khẩu'
                  className='border-input h-10 rounded-lg'
                  autoComplete='current-password'
                  {...register('password')}
                />
                {errors.password && (
                  <p className='text-destructive mt-1 text-xs wrap-break-word'>{errors.password.message}</p>
                )}
                {errors.root && (
                  <p className='text-destructive mb-4 text-center text-sm font-medium'>{errors.root.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type='submit'
                className='btn-auth w-full cursor-pointer'
                size='lg'
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>

              {/* Divider */}
              <div className='relative flex items-center gap-4'>
                <Separator className='flex-1' />
                <span className='text-muted-foreground text-xs'>hoặc</span>
                <Separator className='flex-1' />
              </div>

              {/* Google Login Button */}
              <div className='flex justify-center'>
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleLoginSuccess(credentialResponse.credential)
                    }
                  }}
                  onError={() => {
                    toast.error('Đăng nhập Google thất bại!')
                  }}
                  useOneTap
                  theme='outline'
                  size='large'
                  width='100%'
                />
              </div>

              {/* Signup link */}
              <p className='text-muted-foreground text-center text-sm'>
                Chưa có tài khoản?{' '}
                <Link
                  to={path.register}
                  className='text-primary focus-visible:ring-ring rounded font-medium underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                >
                  Đăng ký
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms - subtle footer */}
      <p className='text-muted-foreground/80 px-2 text-center text-xs'>
        Bằng việc đăng nhập, bạn đồng ý với{' '}
        <a href='#' className='hover:text-primary underline underline-offset-2'>
          Điều khoản sử dụng
        </a>{' '}
        và{' '}
        <a href='#' className='hover:text-primary underline underline-offset-2'>
          Chính sách bảo mật
        </a>
        .
      </p>
    </div>
  )
}
