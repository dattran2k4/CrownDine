import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import type { User } from '@/types/profile.type'

interface AuthState {
  accessToken: string | null
  isAuthenticated: boolean
  roles: string[]
  user: User | null
  setAuth: (accessToken: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      roles: [],
      user: null,
      setAuth: (accessToken: string) => {
        try {
          const decoded = jwtDecode<{ authorities?: string[] }>(accessToken)
          set({
            accessToken,
            isAuthenticated: true,
            roles: decoded.authorities || []
          })
        } catch {
          set({ accessToken, isAuthenticated: true, roles: [] })
        }
      },
      setUser: (user: User) => set({ user }),
      logout: () => set({ accessToken: null, isAuthenticated: false, roles: [], user: null })
    }),
    {
      name: 'auth-storage'
    }
  )
)
