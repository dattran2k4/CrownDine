export interface PaymentDetailResponse {
  id: number
  code: number
  amount: number
  transactionCode?: string | null
  rawApiData?: string | null
  method: string
  status: string
  type: string
  target: string
  source: string
  orderCode?: string | null
  reservationCode?: string | null
  username?: string | null
  createdAt: string
  updatedAt: string
}
