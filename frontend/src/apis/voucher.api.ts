import type { ApiResponse, PageResponse } from '@/types/utils.type'
import type {
  Voucher,
  VoucherAssignmentResponse,
  VoucherAssignUsersPayload,
  VoucherValidateRequest,
  VoucherValidateResponse
} from '@/types/voucher.type'
import http from '@/utils/http'

const VOUCHER_URL = '/vouchers'

export type VoucherListParams = {
  search?: string
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT'
  page?: number
  size?: number
}

const voucherApi = {
  getVouchers(params: VoucherListParams = {}) {
    const { search, type, page = 1, size = 10 } = params
    return http.get<ApiResponse<PageResponse<Voucher>>>(VOUCHER_URL, {
      params: { search, type, page, size }
    })
  },

  getVoucherById(id: number) {
    return http.get<ApiResponse<Voucher>>(`${VOUCHER_URL}/${id}`)
  },

  createVoucher(data: {
    name: string
    code: string
    type: 'PERCENTAGE' | 'FIXED_AMOUNT'
    discountValue: number
    maxDiscountValue?: number | null
    minValue?: number | null
    description?: string | null
  }) {
    return http.post<ApiResponse<Voucher>>(VOUCHER_URL, data)
  },

  updateVoucher(id: number, data: {
    name: string
    code: string
    type: 'PERCENTAGE' | 'FIXED_AMOUNT'
    discountValue: number
    maxDiscountValue?: number | null
    minValue?: number | null
    description?: string | null
  }) {
    return http.patch<ApiResponse<Voucher>>(`${VOUCHER_URL}/${id}`, data)
  },

  assignUsers(voucherId: number, payload: VoucherAssignUsersPayload) {
    return http.post<ApiResponse<VoucherAssignmentResponse[]>>(`${VOUCHER_URL}/${voucherId}/assign-users`, payload)
  },

  getAssignments(voucherId: number) {
    return http.get<ApiResponse<VoucherAssignmentResponse[]>>(`${VOUCHER_URL}/${voucherId}/assignments`)
  },

  validateVoucher(data: VoucherValidateRequest) {
    return http.post<ApiResponse<VoucherValidateResponse>>(`${VOUCHER_URL}/validate`, data)
  },

  exchangeVoucher(id: number) {
    return http.post<ApiResponse<void>>(`${VOUCHER_URL}/${id}/exchange`)
  }
}

export default voucherApi
