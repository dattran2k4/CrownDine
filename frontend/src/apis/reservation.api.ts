import type { ApiResponse, PageResponse } from '@/types/utils.type'
import type {
  ReservationCreateRequest,
  ReservationCreateResponse,
  OrderDetailResponse,
  StaffReservationResponse,
  ReservationUpdateTableRequest,
  ReservationHistoryResponse,
  OrderItemRequest,
  OrderItemRemoveRequest
} from '@/types/reservation.type'
import http from '@/utils/http'

const RESERVATION_URL = '/reservations'

const reservationApi = {
  getReservationHistory(params: { page?: number; size?: number }) {
    return http.get<ApiResponse<PageResponse<ReservationHistoryResponse>>>(`${RESERVATION_URL}/history`, { params })
  },

  getAllReservations(params: { fromDate?: string; toDate?: string; status?: string; page?: number; size?: number }) {
    return http.get<ApiResponse<PageResponse<StaffReservationResponse>>>(`${RESERVATION_URL}/all`, { params })
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

  checkInReservation(reservationId: number) {
    return http.post<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/check-in`)
  },

  updateReservationTable(reservationId: number, data: ReservationUpdateTableRequest) {
    return http.put<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/update-table`, data)
  }
}

export default reservationApi
