import type { ApiResponse } from '@/types/utils.type'
import http from '@/utils/http'

const RESERVATION_URL = '/reservations'

export interface ReservationCreateRequest {
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  guestNumber: number
  tableId: number
  note?: string
}

export interface ReservationCreateResponse {
  reservationId: number
  date: string
  startTime: string
  endTime: string
  guestNumber: number
  note?: string
  code: string
  status: string
  depositAmount: number
  expiratedAt: string
  tableName: string
  floorNumber?: number
}

export interface OrderLineResponse {
  orderDetailId: number
  name: string
  type: 'ITEM' | 'COMBO'
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderDetailResponse {
  orderId: number
  tableName: string
  status: string
  totalPrice: number
  discountPrice: number
  finalPrice: number
  itemsTotal: number
  tableDeposit: number
  depositAmount: number
  remainingAmount: number
  createdAt: string
  items: OrderLineResponse[]
}

export interface OrderItemRequest {
  itemId?: number
  comboId?: number
  quantity: number
  note?: string
}

export interface OrderItemRemoveRequest {
  itemId?: number
  comboId?: number
}

const reservationApi = {
  createReservation(data: ReservationCreateRequest) {
    return http.post<ApiResponse<ReservationCreateResponse>>(`${RESERVATION_URL}/create`, data)
  },

  getReservationOrderDetails(reservationId: number) {
    return http.get<ApiResponse<OrderDetailResponse>>(`${RESERVATION_URL}/${reservationId}/order-details`)
  },

  cancelReservation(reservationId: number) {
    return http.delete<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/cancel`)
  },

  addItemToReservation(reservationId: number, data: OrderItemRequest) {
    return http.post<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/add-item`, data)
  },

  updateItemInReservation(reservationId: number, data: OrderItemRequest) {
    return http.put<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/upd-item`, data)
  },

  removeItemFromReservation(reservationId: number, data: OrderItemRemoveRequest) {
    return http.delete<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/remove-item`, { data })
  }
}

export default reservationApi
