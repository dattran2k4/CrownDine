import { useMutation } from '@tanstack/react-query'
import authApi from '@/apis/auth.api'
import userApi from '@/apis/user.api'
import { useAuthStore } from '@/stores/useAuthStore'

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth)
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async (data: Parameters<typeof authApi.login>[0]) => {
      // 1. Gọi API đăng nhập
      const response = await authApi.login(data)
      // Backend đang trả TokenResponse trực tiếp, không bọc trong ApiResponse
      const accessToken = response.data?.accessToken
      const refreshToken = response.data?.refreshToken

      // 2. Nếu có token thì lưu vào Zustand
      if (accessToken && refreshToken) {
        setAuth(accessToken, refreshToken)

        // 3. Sau đó gọi API lấy profile (dùng interceptor để gắn Authorization)
        try {
          const profileRes = await userApi.getProfile()
          if (profileRes.data?.data) {
            setUser(profileRes.data.data)
          }
        } catch (error) {
          // Chỉ log lỗi, không chặn luồng đăng nhập
          console.error('Failed to fetch profile after login:', error)
        }
      }

      return response
    }
  })
}
