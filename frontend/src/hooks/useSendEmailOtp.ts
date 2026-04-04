import userApi from '@/apis/user.api'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

const useSendEmailOtp = () => {
  return useMutation({
    mutationFn: (newEmail: string) => userApi.sendEmailOtp(newEmail),
    onSuccess: () => {
      toast.success('Mã OTP đã được gửi đến email cũ của bạn')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã OTP'
      toast.error(message)
    }
  })
}

export default useSendEmailOtp
