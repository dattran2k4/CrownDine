import userApi from '@/apis/user.api'
import type { ChangePasswordRequest } from '@/types/profile.type'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu'
      toast.error(message)
    }
  })
}

export default useChangePassword
