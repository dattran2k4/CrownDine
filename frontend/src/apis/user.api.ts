import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import type { UpdateUserRequest, User } from '@/types/profile.type'

const userApi = {
  getProfile() {
    return http.get<ApiResponse<User>>('users/profile', {
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
  },
  getCustomerByPhone(phone: string) {
    return http.get<ApiResponse<any>>(`users/customer/${phone}`)
  },
  getAllCustomers() {
    return http.get<ApiResponse<any[]>>('users')
  },
  getAvailableVouchers(customerId: number) {
    return http.get<ApiResponse<any>>(`user-vouchers/customer/${customerId}`)
  }
}

export default userApi
