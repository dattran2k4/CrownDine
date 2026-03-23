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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <StompSessionProvider
          // Thay makeSocket bằng webSocketFactory
          url='ws://localhost:8080/ws-restaurant'
          heartbeatIncoming={10000}
          heartbeatOutgoing={10000}
          onConnect={() => console.log('WebSocket Connected!')}
          onDisconnect={() => console.log('WebSocket Disconnected!')}
          // Một số phiên bản dùng debug thay vì debugConfig
          debug={(str) => console.log(str)}
        >
          <ThemeProvider attribute='class' defaultTheme='light' disableTransitionOnChange>
            <RouterProvider router={router} />
            <Toaster richColors position='top-right' />
          </ThemeProvider>
        </StompSessionProvider>
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
