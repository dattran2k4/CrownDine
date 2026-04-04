import { useMutation } from '@tanstack/react-query'
import authApi from '@/apis/auth.api'
import userApi from '@/apis/user.api'
import { useAuthStore } from '@/stores/useAuthStore'

export const useGoogleLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (idToken: string) => {
      const response = await authApi.googleLogin(idToken)
      const accessToken = response.data?.accessToken
      const refreshToken = response.data?.refreshToken

      if (accessToken && refreshToken) {
        setAuth(accessToken, refreshToken)

        try {
          const profileRes = await userApi.getProfile()
          if (profileRes.data?.data) {
            setUser(profileRes.data.data)
          }
        } catch (error) {
          console.error('Failed to fetch profile after Google login:', error)
        }
      }

      return response
    }
  })
}
