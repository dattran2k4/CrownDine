import type {
  Order,
  OrderStatus,
  OrderRequest,
  OrderItemBatchRequest,
  UpdateOrderDetailRequest
} from '@/types/order.type'
import type { ApiResponse, PageResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const TABLE_URL = 'orders'

const orderApi = {
  getAllOrders(params: { fromDate?: string; toDate?: string; status?: OrderStatus }) {
    return http.get<ApiResponse<PageResponse<Order>>>(`${TABLE_URL}?`, { params })
  },

  createOrder(body: OrderRequest) {
    return http.post<ApiResponse<null>>(`${TABLE_URL}`, body)
  },

  openOrderForReservation(reservationId: number, body: OrderItemBatchRequest) {
    return http.post<ApiResponse<Order>>(`${TABLE_URL}/reservation/${reservationId}`, body)
  },

  addOrderDetails(orderId: number, body: OrderItemBatchRequest) {
    return http.post<ApiResponse<null>>(`${TABLE_URL}/${orderId}/details`, body)
  },

  updateOrderDetail(detailId: number, body: UpdateOrderDetailRequest) {
    return http.patch<ApiResponse<null>>(`order-details/${detailId}/upd`, body)
  },

  deleteOrderDetail(detailId: number) {
    return http.delete<ApiResponse<null>>(`order-details/${detailId}/del`)
  },

  createPaymentLink(body: { orderCode: string; returnUrl?: string; method: string }) {
    return http.post<ApiResponse<any>>('payments/create', body)
  },

  updateOrderStatus(orderId: number, status: OrderStatus) {
    return http.patch<ApiResponse<any>>(`${TABLE_URL}/${orderId}/status?status=${status}`)
  },

  applyVoucher(orderId: number, code: string) {
    return http.post<ApiResponse<any>>(`${TABLE_URL}/${orderId}/voucher/apply`, { code })
  },

  removeVoucher(orderId: number) {
    return http.post<ApiResponse<any>>(`${TABLE_URL}/${orderId}/voucher/remove`)
  },

  mapCustomerToOrder(orderId: number, customerId: number) {
    return http.patch<ApiResponse<null>>(`${TABLE_URL}/${orderId}/customer/${customerId}`)
  }
}

export default orderApi
