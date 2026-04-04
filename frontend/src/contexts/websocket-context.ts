import { createContext, useContext } from 'react'

export const WebSocketEnabledContext = createContext(false)

export function useWebSocketEnabled() {
  return useContext(WebSocketEnabledContext)
}
