export interface PaymentResultStorageData {
  code?: string
  paymentId?: string
  cancel?: boolean
  status?: string
  orderCode?: string
  reservationCode?: string
  amount?: number
  paidAt?: string
}

const PAYMENT_RESULT_STORAGE_KEY = 'crowndine_payment_result'

export function getPaymentResultFromSession(): PaymentResultStorageData | null {
  const raw = sessionStorage.getItem(PAYMENT_RESULT_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as PaymentResultStorageData
  } catch {
    sessionStorage.removeItem(PAYMENT_RESULT_STORAGE_KEY)
    return null
  }
}

export function setPaymentResultToSession(data: PaymentResultStorageData) {
  sessionStorage.setItem(PAYMENT_RESULT_STORAGE_KEY, JSON.stringify(data))
}

export function clearPaymentResultFromSession() {
  sessionStorage.removeItem(PAYMENT_RESULT_STORAGE_KEY)
}
