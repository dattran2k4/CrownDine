import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import type { User } from '@/types/profile.type'

const userApi = {
  getProfile(token?: string) {
    return http.get<ApiResponse<User>>('users/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
  }
}

export default userApi
