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
    onSuccess: (response, variables) => {
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        // Merge the manually submitted fields, but wait! The variables have `dateOfBirth` as dd/MM/yyyy and `gender` as UPPERCASE.
        // It's safer to just trigger invalidation and let the GET profile fetch the fresh data.
        // Or we map it directly:
        setUser({ ...currentUser, ...variables, gender: variables.gender?.toLowerCase() as any })
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error(message)
    }
  })
}

export default useUpdateProfile
