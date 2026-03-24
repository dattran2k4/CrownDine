import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { StompSessionProvider } from 'react-stomp-hooks'
import '@/index.css'
import router from '@/router'
import { AppProvider } from '@/contexts/app.context'
import { useAuthStore } from '@/stores/useAuthStore'
import NotificationRealtimeListener from '@/components/NotificationRealtimeListener/NotificationRealtimeListener'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0
    }
  }
})

function AppWebSocketProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const rawAccessToken = accessToken?.startsWith('Bearer ') ? accessToken.slice(7) : accessToken
  const websocketUrl = rawAccessToken
    ? `ws://localhost:8080/ws-restaurant?access_token=${encodeURIComponent(rawAccessToken)}`
    : 'ws://localhost:8080/ws-restaurant'

  return (
    <StompSessionProvider
      key={accessToken || 'anonymous'}
      url={websocketUrl}
      heartbeatIncoming={10000}
      heartbeatOutgoing={10000}
      onConnect={() => console.log('WebSocket Connected!')}
      onDisconnect={() => console.log('WebSocket Disconnected!')}
      debug={(str) => console.log(str)}
    >
      {children}
    </StompSessionProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <AppWebSocketProvider>
          <NotificationRealtimeListener />
          <RouterProvider router={router} />
          <Toaster richColors position='top-right' />
        </AppWebSocketProvider>
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
