import { useQueryClient } from '@tanstack/react-query'
import { useSubscription } from 'react-stomp-hooks'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'
import type { NotificationRealtimeResponse } from '@/types/notification.type'

export default function NotificationRealtimeListener() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return null
  }

  return <NotificationRealtimeSubscription />
}

function NotificationRealtimeSubscription() {
  const queryClient = useQueryClient()

  useSubscription('/user/queue/notifications', (message) => {
    const realtimeNotification = JSON.parse(message.body) as NotificationRealtimeResponse

    queryClient.invalidateQueries({ queryKey: ['my-notifications'] })
    queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] })

    toast.success(realtimeNotification.title, {
      description: realtimeNotification.message
    })
  })

  return null
}
