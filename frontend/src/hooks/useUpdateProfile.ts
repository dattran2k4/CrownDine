import userApi from '@/apis/user.api'
import { useAuthStore } from '@/stores/useAuthStore'
import type { UpdateUserRequest } from '@/types/profile.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userApi.updateProfile(data),
    onSuccess: (_, variables) => {
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        setUser({ ...currentUser, ...variables, gender: variables.gender?.toLowerCase() as any })
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Thay đổi thông tin cá nhân thành công!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error(message)
    }
  })
}

export default useUpdateProfile
