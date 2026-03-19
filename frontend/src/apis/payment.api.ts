import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const PAYMENT_URL = '/payments'

export interface CreatePaymentRequest {
  reservationCode?: string
  orderCode?: string
  method: 'PAYOS' | 'CASH'
}

const paymentApi = {
  createPayment(data: CreatePaymentRequest) {
    return http.post<ApiResponse<string>>(`${PAYMENT_URL}/create`, data)
  }
}

export default paymentApi
