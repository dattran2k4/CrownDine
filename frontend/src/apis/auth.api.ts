import type { AuthResponse } from '@/types/auth.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const authApi = {
  login(body: { username: string; password: string }) {
    return http.post<AuthResponse>('auth/login', body)
  },
  register(body: {
    username: string
    password: string
    confirmPassword: string
    email: string
    phone: string
    firstName: string
    lastName: string
  }) {
    return http.post<ApiResponse<number>>('auth/register', body)
  },
  verifyRegister(verifyCode: string) {
    return http.post<ApiResponse<null>>(`auth/verify-register?verifyCode=${verifyCode}`)
  },
  logout() {
    return http.post<ApiResponse<null>>('auth/logout')
  },
  refreshToken(refreshToken: string) {
    return http.post<AuthResponse>(`auth/refresh-token?refreshToken=${refreshToken}`)
  }
}

export default authApi
