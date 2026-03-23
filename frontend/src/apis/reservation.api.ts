import type { ApiResponse } from '@/types/utils.type'
import type {
  ReservationCreateRequest,
  ReservationCreateResponse,
  OrderDetailResponse,
  OrderItemRequest,
  OrderItemRemoveRequest,
  ReservationUpdateTableRequest
} from '@/types/reservation.type'
import http from '@/utils/http'

const RESERVATION_URL = '/reservations'

const reservationApi = {
  getAllReservations(params: { fromDate?: string; toDate?: string; status?: string; page?: number; size?: number }) {
    return http.get<ApiResponse<any>>(`${RESERVATION_URL}/all`, { params })
  },

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
  },

  updateReservationTable(reservationId: number, data: ReservationUpdateTableRequest) {
    return http.put<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/update-table`, data)
  }
}

export default reservationApi
