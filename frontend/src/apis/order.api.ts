import type { Order, OrderStatus } from '@/types/order.type'
import type { ApiResponse, PageResponse } from '@/types/utils.type'
import http from '@/utils/http'

export const TABLE_URL = 'orders'

const orderApi = {
  getAllOrders(params: { fromDate?: string; toDate?: string; status?: OrderStatus }) {
    return http.get<ApiResponse<PageResponse<Order>>>(`${TABLE_URL}?`, { params })
  }
}

export default orderApi
