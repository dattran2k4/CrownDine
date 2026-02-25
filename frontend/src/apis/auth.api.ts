import type { AuthResponse } from '@/types/auth.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const LOGIN_URL = 'auth/login'
export const REFRESH_TOKEN_URL = 'auth/refresh-token'
export const REGISTER_URL = 'auth/register'
export const VERIFY_REGISTER_URL = 'auth/register'
export const LOGOUT_URL = 'auth/logout'

const authApi = {
  login(body: { username: string; password: string }) {
    return http.post<AuthResponse>(LOGIN_URL, body)
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
    return http.post<ApiResponse<number>>(REGISTER_URL, body)
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
