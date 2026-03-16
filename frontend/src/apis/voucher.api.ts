import type { VoucherValidateRequest, VoucherValidateResponse } from '@/types/voucher.type'
import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const VOUCHER_URL = '/vouchers'

const voucherApi = {
  validateVoucher(data: VoucherValidateRequest) {
    return http.post<ApiResponse<VoucherValidateResponse>>(`${VOUCHER_URL}/validate`, data)
  }
}

export default voucherApi
