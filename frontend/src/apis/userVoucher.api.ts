import type { ApiResponse } from '@/types/utils.type'
import type { MyVoucherResponse } from '@/types/voucher.type'
import http from '@/utils/http'

const USER_VOUCHER_URL = 'user-vouchers'

const userVoucherApi = {
  getMyVouchers() {
    return http.get<ApiResponse<MyVoucherResponse[]>>(`${USER_VOUCHER_URL}/my`)
  }
}

export default userVoucherApi
