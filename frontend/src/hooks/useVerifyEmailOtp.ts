import userApi from '@/apis/user.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'

const useVerifyEmailOtp = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  
  return useMutation({
    mutationFn: (data: { otp: string; newEmail: string }) => userApi.verifyEmailOtp(data),
    onSuccess: async () => {
      // Invalidate query to refetch profile
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      
      // Fetch fresh profile data and update global auth store
      try {
        const res = await userApi.getProfile()
        if (res.data?.data) {
          setUser(res.data.data)
        }
      } catch (error) {
        console.error('Failed to sync profile after email update:', error)
      }

      toast.success('Đổi email thành công!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn'
      toast.error(message)
    }
  })
}

export default useVerifyEmailOtp
