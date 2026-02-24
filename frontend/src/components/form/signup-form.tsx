import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { GoogleIcon } from '@/components/ui/google-icon'
import path from '@/constants/path'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signupFormSchema, type SignupFormValues } from '@/utils/auth.schema'

import { isAxiosError } from '@/utils/utils'
import type { ErrorResponse } from '@/types/utils.type'
import useSignup from '@/hooks/useSignup'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema)
  })
  const signupMutation = useSignup()

  const onSubmit = handleSubmit((data) => {
    signupMutation.mutate(data, {
      onSuccess: () => {
        navigate(path.verifyRegister)
      },
      onError: (error) => {
        if (isAxiosError<ErrorResponse>(error)) {
          const serverMessage = error.response?.data?.message
          setError('root', {
            type: 'server',
            message: serverMessage || 'Đăng ký thất bại, vui lòng kiểm tra lại thông tin.'
          })
        }
      }
    })
  })
  return (
    <div className={cn('signup-form flex flex-col gap-5', className)} {...props}>
      <Card className='signup-form-card border-border bg-card overflow-hidden rounded-xl border p-0 shadow-lg'>
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
                <h1 className='text-foreground text-2xl font-bold tracking-tight'>Tạo tài khoản</h1>
                <p className='text-muted-foreground text-sm text-balance'>Chào mừng bạn, hãy đăng ký để bắt đầu.</p>
              </div>

              {/* Họ & Tên */}
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='flex min-w-0 flex-col gap-2'>
                  <Label htmlFor='lastname' className='text-sm font-medium'>
                    Họ
                  </Label>
                  <Input type='text' id='lastname' placeholder='Nhập họ' {...register('lastName')} />
                  {errors.lastName && (
                    <p className='text-destructive mt-1 text-xs break-words'>{errors.lastName.message}</p>
                  )}
                </div>
                <div className='flex min-w-0 flex-col gap-2'>
                  <Label htmlFor='firstname' className='text-sm font-medium'>
                    Tên
                  </Label>
                  <Input type='text' id='firstname' placeholder='Nhập tên' {...register('firstName')} />
                  {errors.firstName && (
                    <p className='text-destructive mt-1 text-xs break-words'>{errors.firstName.message}</p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='username' className='text-sm font-medium'>
                  Tên đăng nhập
                </Label>
                <Input type='text' id='username' placeholder='Nhập tên đăng nhập' {...register('username')} />
                {errors.username && (
                  <p className='text-destructive mt-1 text-xs break-words'>{errors.username.message}</p>
                )}
              </div>

              {/* Email */}
              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='email' className='text-sm font-medium'>
                  Email
                </Label>
                <Input type='email' id='email' placeholder='Nhập email' {...register('email')} />
                {errors.email && <p className='text-destructive mt-1 text-xs break-words'>{errors.email.message}</p>}
              </div>
              {/* Phone */}
              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='phone' className='text-sm font-medium'>
                  Số điện thoại
                </Label>
                <Input type='text' id='phone' placeholder='Nhập số điện thoại' {...register('phone')} />
                {errors.phone && <p className='text-destructive mt-1 text-xs break-words'>{errors.phone.message}</p>}
              </div>
              {/* Password */}
              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='password' className='text-sm font-medium'>
                  Mật khẩu
                </Label>
                <Input type='password' id='password' placeholder='Nhập mật khẩu' {...register('password')} />
                {errors.password && (
                  <p className='text-destructive mt-1 text-xs break-words'>{errors.password.message}</p>
                )}
              </div>
              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='confirmPassword' className='text-sm font-medium'>
                  Xác nhận mật khẩu
                </Label>
                <Input
                  type='password'
                  id='confirmPassword'
                  placeholder='Nhập lại mật khẩu'
                  autoComplete='new-password'
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className='text-destructive mt-1 text-xs break-words'>{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button type='submit' className='btn-auth w-full' size='lg' disabled={signupMutation.isPending}>
                {signupMutation.isPending ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </Button>

              {/* Divider */}
              <div className='relative flex items-center gap-4'>
                <Separator className='flex-1' />
                <span className='text-muted-foreground text-xs'>hoặc</span>
                <Separator className='flex-1' />
              </div>

              {/* Google Signup Button */}
              <Button
                type='button'
                className='btn-auth w-full'
                size='lg'
                onClick={() => {
                  // TODO: Implement Google signup
                  console.log('Google signup clicked')
                }}
              >
                <GoogleIcon className='size-5' />
                Đăng ký với Google
              </Button>

              {/* Login link */}
              <p className='text-muted-foreground text-center text-sm'>
                Đã có tài khoản?{' '}
                <Link
                  to={path.login}
                  className='text-primary focus-visible:ring-ring rounded font-medium underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Terms - subtle footer */}
      <p className='text-muted-foreground/80 px-2 text-center text-xs'>
        Bằng việc đăng ký, bạn đồng ý với{' '}
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
