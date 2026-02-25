import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import path from '@/constants/path'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useVerifyRegister from '@/hooks/useVerifyRegister'
import { isAxiosErrorUnthorized } from '@/utils/utils'
import type { ErrorResponse } from '@/types/utils.type'
import { toast } from 'sonner' // or React Toastify, whichever UI uses

const verifySchema = z.object({
  verifyCode: z.string().min(1, 'Vui lòng nhập mã xác thực')
})

type VerifyFormValues = z.infer<typeof verifySchema>

export function VerifyRegister({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema)
  })
  const verifyMutation = useVerifyRegister()

  const onSubmit = handleSubmit((data) => {
    verifyMutation.mutate(data.verifyCode, {
      onSuccess: () => {
        toast.success('Xác thực tài khoản thành công!')
        navigate(path.login)
      },
      onError: (error) => {
        if (isAxiosErrorUnthorized<ErrorResponse>(error)) {
          const serverMessage = error.response?.data?.message
          setError('root', {
            type: 'server',
            message: serverMessage || 'Mã xác thực không đúng'
          })
        } else {
          setError('root', {
            type: 'server',
            message: 'Mã xác thực không đúng hoặc đã hết hạn.'
          })
        }
      }
    })
  })

  return (
    <div
      className={cn('mx-auto flex min-h-[calc(100vh-200px)] w-full max-w-md flex-col justify-center gap-5', className)}
      {...props}
    >
      <Card className='border-border bg-card overflow-hidden rounded-xl border p-0 shadow-lg'>
        <CardContent className='p-0'>
          <form className='p-5 sm:p-6' onSubmit={onSubmit}>
            <div className='flex flex-col gap-5'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-foreground text-2xl font-bold tracking-tight'>Xác thực tài khoản</h1>
                <p className='text-muted-foreground text-sm text-balance'>
                  Mã xác nhận đã được gửi vào email của bạn. Vui lòng kiểm tra và nhập mã để hoàn tất đăng ký.
                </p>
              </div>

              <div className='flex min-w-0 flex-col gap-2'>
                <Label htmlFor='verifyCode' className='text-sm font-medium'>
                  Mã xác thực
                </Label>
                <Input type='text' id='verifyCode' placeholder='Nhập mã xác thực' {...register('verifyCode')} />
                {errors.verifyCode && (
                  <p className='text-destructive mt-1 text-xs break-words'>{errors.verifyCode.message}</p>
                )}
                {errors.root && <p className='text-destructive mt-1 text-xs break-words'>{errors.root.message}</p>}
              </div>

              <Button
                type='submit'
                className='btn-auth w-full cursor-pointer'
                size='lg'
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
export default VerifyRegister
