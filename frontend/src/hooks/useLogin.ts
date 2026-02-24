import { useMutation } from '@tanstack/react-query'
import authApi from '@/apis/auth.api'
import { useAuthStore } from '@/stores/useAuthStore'

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const accessToken = response.data?.data?.accessToken
      if (accessToken) {
        setAuth(accessToken)
      }
    }
  })
}
