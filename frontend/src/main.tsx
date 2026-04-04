import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { StompSessionProvider } from 'react-stomp-hooks'
import '@/index.css'
import router from '@/router'
import { AppProvider } from '@/contexts/app.context'
import { WebSocketEnabledProvider } from '@/contexts/WebSocketEnabledProvider'
import { useAuthStore } from '@/stores/useAuthStore'
import NotificationRealtimeListener from '@/components/NotificationRealtimeListener/NotificationRealtimeListener'
import { jwtDecode } from 'jwt-decode'
import { GoogleOAuthProvider } from '@react-oauth/google'

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
  const hasValidAccessToken = isAccessTokenStillValid(accessToken)

  if (!hasValidAccessToken || !accessToken) {
    return <WebSocketEnabledProvider enabled={false}>{children}</WebSocketEnabledProvider>
  }

  const rawAccessToken = accessToken?.startsWith('Bearer ') ? accessToken.slice(7) : accessToken
  const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080'
  const websocketUrl = rawAccessToken
    ? `${wsBaseUrl}/ws-restaurant?access_token=${encodeURIComponent(rawAccessToken)}`
    : `${wsBaseUrl}/ws-restaurant`

  return (
    <WebSocketEnabledProvider enabled={true}>
      <StompSessionProvider
        key={accessToken || 'anonymous'}
        url={websocketUrl}
        reconnectDelay={5000}
        heartbeatIncoming={10000}
        heartbeatOutgoing={10000}
        onConnect={() => console.log('WebSocket Connected!')}
        onDisconnect={() => console.log('WebSocket Disconnected!')}
        debug={(str) => console.log(str)}
      >
        <NotificationRealtimeListener />
        {children}
      </StompSessionProvider>
    </WebSocketEnabledProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ThemeProvider attribute='class' defaultTheme='light' disableTransitionOnChange>
            <AppWebSocketProvider>
              <RouterProvider router={router} />
              <Toaster richColors position='top-right' />
            </AppWebSocketProvider>
          </ThemeProvider>
        </AppProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
)

function isAccessTokenStillValid(accessToken: string | null) {
  if (!accessToken) {
    return false
  }

  const rawAccessToken = accessToken.startsWith('Bearer ') ? accessToken.slice(7) : accessToken

  try {
    const decoded = jwtDecode<{ exp?: number }>(rawAccessToken)
    if (!decoded.exp) {
      return false
    }

    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}
