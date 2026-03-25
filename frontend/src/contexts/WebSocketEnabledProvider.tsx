import type { ReactNode } from 'react'
import { WebSocketEnabledContext } from './websocket-context'

export function WebSocketEnabledProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return <WebSocketEnabledContext.Provider value={enabled}>{children}</WebSocketEnabledContext.Provider>
}
