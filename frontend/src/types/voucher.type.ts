export type VoucherType = 'PERCENTAGE' | 'FIXED_AMOUNT'

export interface Voucher {
  id: number
  name: string
  code: string
  type: VoucherType
  discountValue: number
  maxDiscountValue: number | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface VoucherFormData {
  name: string
  code: string
  type: VoucherType
  discountValue: string
  maxDiscountValue: string
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
