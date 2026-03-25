export type VoucherType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export interface Voucher {
  id: number
  name: string
  code: string
  type: VoucherType
  discountValue: number
  maxDiscountValue: number | null
  minValue: number | null
  description: string | null
  pointsRequired?: number
  createdAt: string
  updatedAt: string
}

export interface VoucherFormData {
  name: string
  code: string
  type: VoucherType
  discountValue: string
  maxDiscountValue: string
  minValue: string
  description: string
}

export interface VoucherAssignmentResponse {
  assignmentId: number
  voucherId: number
  voucherCode: string
  customerId: number
  username: string
  fullName: string
  usageCount: number
  usageLimit: number
  assignedAt: string
  expiredAt: string
}

export interface VoucherAssignUsersPayload {
  userIds: number[]
  usageLimit: number
  expiredAt: string
}

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
  minValue: number | null
  discountAmount: number
  finalAmount: number
  usageCount: number
  usageLimit: number
}

export interface MyVoucherResponse {
  assignmentId: number
  voucherId: number
  voucherCode: string
  voucherName: string
  voucherType: VoucherType
  discountValue: number
  maxDiscountValue: number | null
  minValue: number | null
  description: string | null
  usageCount: number
  usageLimit: number | null
  assignedAt: string
  expiredAt: string
}
