import type { NotificationListResponse, UnreadNotificationCountApiResponse } from '@/types/notification.type'
import http from '@/utils/http'

const NOTIFICATION_URL = '/notifications'

const notificationApi = {
  getMyNotifications(page = 1, size = 10) {
    return http.get<NotificationListResponse>(NOTIFICATION_URL, {
      params: {
        page,
        size
      }
    })
  },

  getUnreadCount() {
    return http.get<UnreadNotificationCountApiResponse>(`${NOTIFICATION_URL}/unread-count`)
  },

  markAsRead(id: number) {
    return http.patch(`${NOTIFICATION_URL}/${id}/read`)
  }
}

export default notificationApi
