import type { ApiResponse, PageResponse } from '@/types/utils.type'
import type {
  ReservationCreateRequest,
  ReservationCheckoutResponse,
  StaffReservationResponse,
  StaffReservationCreateRequest,
  ReservationUpdateTableRequest,
  ReservationHistoryResponse,
  OrderItemRequest,
  OrderItemRemoveRequest
} from '@/types/reservation.type'
import http from '@/utils/http'

const RESERVATION_URL = 'reservations'

const reservationApi = {
  getReservationHistory(params: { page?: number; size?: number }) {
    return http.get<ApiResponse<PageResponse<ReservationHistoryResponse>>>(`${RESERVATION_URL}/history`, { params })
  },

  getAllReservations(params: { fromDate?: string; toDate?: string; status?: string; page?: number; size?: number }) {
    return http.get<ApiResponse<PageResponse<StaffReservationResponse>>>(`${RESERVATION_URL}/all`, { params })
  },

  createReservation(data: ReservationCreateRequest) {
    return http.post<ApiResponse<ReservationCheckoutResponse>>(`${RESERVATION_URL}/create`, data)
  },

  createWalkInReservationByStaff(data: StaffReservationCreateRequest) {
    return http.post<ApiResponse<ReservationCheckoutResponse>>(`${RESERVATION_URL}/staff-create`, data)
  },

  getReservationCheckout(reservationId: number) {
    return http.get<ApiResponse<ReservationCheckoutResponse>>(`${RESERVATION_URL}/${reservationId}/checkout`)
  },

  cancelReservation(reservationId: number) {
    return http.delete<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/cancel`)
  },

  cancelReservationByStaff(reservationId: number) {
    return http.post<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/cancel`)
  },

  noShowReservation(reservationId: number) {
    return http.post<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/no-show`)
  },

  completeReservation(reservationId: number) {
    return http.post<ApiResponse<void>>(`${RESERVATION_URL}/${reservationId}/complete`)
  },

  addItemToReservation(reservationId: number, data: OrderItemRequest) {
    return http.post<ApiResponse<ReservationCheckoutResponse>>(`${RESERVATION_URL}/${reservationId}/add-item`, data)
  },

  updateItemInReservation(reservationId: number, data: OrderItemRequest) {
    return http.put<ApiResponse<ReservationCheckoutResponse>>(`${RESERVATION_URL}/${reservationId}/upd-item`, data)
  },

  removeItemFromReservation(reservationId: number, data: OrderItemRemoveRequest) {
    return http.delete<ApiResponse<ReservationCheckoutResponse>>(`${RESERVATION_URL}/${reservationId}/remove-item`, { data })
  },

  checkInReservation(id: number, staffId?: string) {
    return http.post<ApiResponse<void>>(`${RESERVATION_URL}/${id}/check-in${staffId ? `?staffId=${staffId}` : ''}`)
  },

  updateReservationTable(reservationId: number, data: ReservationUpdateTableRequest) {
    return http.put<ApiResponse<ReservationCheckoutResponse>>(`${RESERVATION_URL}/${reservationId}/update-table`, data)
  }
}

export default reservationApi
