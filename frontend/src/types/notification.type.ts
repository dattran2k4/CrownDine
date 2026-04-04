import type { ApiResponse, PageResponse } from '@/types/utils.type'

export type NotificationType =
  | 'VOUCHER_GRANTED'
  | 'VOUCHER_EXPIRING_SOON'
  | 'VOUCHER_EXPIRED'
  | 'RESERVATION_CONFIRMED'
  | 'RESERVATION_REMINDER'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  message: string
  payload: string | null
  readAt: string | null
  createdAt: string
}

export interface UnreadNotificationCount {
  unreadCount: number
}

export interface NotificationRealtimeResponse {
  id: number
  type: NotificationType
  title: string
  message: string
  payload: string | null
  createdAt: string
  unreadCount: number
}

export type NotificationListResponse = ApiResponse<PageResponse<NotificationItem>>
export type UnreadNotificationCountApiResponse = ApiResponse<UnreadNotificationCount>
