export type VoucherType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export interface VoucherValidateRequest {
  code: string
  orderId: number
}

export interface VoucherValidateResponse {
  voucherId: number
  code: string
  name: string
  type: VoucherType
  orderAmount: number
  discountAmount: number
  finalAmount: number
  usageCount: number
  usageLimit: number
}
