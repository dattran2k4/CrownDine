import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { GoogleIcon } from '@/components/ui/google-icon'
import path from '@/constants/path'
import { signinSchema, type SigninFormValues } from '@/utils/auth.schema'
import { z } from 'zod'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  // const{signIn} = useAuthStore();
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema)
  })
  const onSubmit = async (data: SigninFormValues) => {
    // const {username,password} = data;
  }

  return (
    <div className={cn('login-form flex flex-col gap-5', className)} {...props}>
      <Card className='login-form-card border-border bg-card overflow-hidden rounded-xl border p-0 shadow-lg'>
        <CardContent className='p-0'>
          <form className='p-5 sm:p-6' onSubmit={handleSubmit(onSubmit)}>
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
                  <p className='text-destructive mt-1 text-xs break-words'>{errors.username.message}</p>
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
                  <p className='text-destructive mt-1 text-xs break-words'>{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button type='submit' className='btn-auth w-full' size='lg' disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
              </Button>

              {/* Divider */}
              <div className='relative flex items-center gap-4'>
                <Separator className='flex-1' />
                <span className='text-muted-foreground text-xs'>hoặc</span>
                <Separator className='flex-1' />
              </div>

              {/* Google Login Button */}
              <Button
                type='button'
                className='btn-auth w-full'
                size='lg'
                onClick={() => {
                  // TODO: Implement Google login
                  console.log('Google login clicked')
                }}
              >
                <GoogleIcon className='size-5' />
                Đăng nhập với Google
              </Button>

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
