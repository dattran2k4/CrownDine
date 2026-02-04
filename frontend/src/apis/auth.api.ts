import type { AuthResponse } from '@/types/auth.type'
import http from '@/utils/http'

const authApi = {
  login(body: { username: string; password: string }) {
    return http.post<AuthResponse>('auth/login', body)
  }
}

export default authApi
