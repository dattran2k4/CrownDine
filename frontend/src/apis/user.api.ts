import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import type { UpdateUserRequest, User } from '@/types/profile.type'

const userApi = {
  getProfile(token?: string) {
    return http.get<ApiResponse<User>>('users/profile', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    }).then(res => {
      if (res.data?.data && (res.data.data as any).avatarUrl) {
        res.data.data.avatar = (res.data.data as any).avatarUrl
      }
      return res
    })
  },
  updateProfile(data: UpdateUserRequest) {
    return http.put<ApiResponse<User>>('users', data)
  },
  uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('image', file)
    return http.patch<ApiResponse<string>>('users/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default userApi
