import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import type { UpdateUserRequest, User, PointHistory, ChangePasswordRequest } from '@/types/profile.type'
import type { PageResponse } from '@/types/utils.type'

const userApi = {
  getPointHistory(page: number = 1, size: number = 5) {
    return http.get<ApiResponse<PageResponse<PointHistory>>>(`users/profile/point-history`, {
      params: { page, size }
    })
  },
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
  },
  changePassword(data: ChangePasswordRequest) {
    return http.post<ApiResponse<any>>('users/change-password', data)
  }
}

export default userApi
