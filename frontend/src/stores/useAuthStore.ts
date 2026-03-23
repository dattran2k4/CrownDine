import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import type { User } from '@/types/profile.type'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  roles: string[]
  user: User | null
  setAuth: (accessToken: string, refreshToken: string) => void
  setAccessToken: (accessToken: string | null) => void
  setUser: (user: User) => void
  logout: () => void
}

const extractRolesFromAccessToken = (accessToken: string): string[] => {
  try {
    const decoded = jwtDecode<{ role?: string[] }>(accessToken)
    if (decoded.role && Array.isArray(decoded.role)) {
      return decoded.role
    }
  } catch {
    return []
  }
  return []
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      roles: [],
      user: null,
      setAuth: (accessToken: string, refreshToken: string) => {
        set((state) => ({
          ...state,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          roles: extractRolesFromAccessToken(accessToken)
        }))
      },
      setAccessToken: (accessToken: string | null) =>
        set((state) => ({
          ...state,
          accessToken,
          isAuthenticated: Boolean(accessToken && state.refreshToken),
          roles: accessToken ? extractRolesFromAccessToken(accessToken) : [],
          user: accessToken ? state.user : null
        })),
      setUser: (user: User) => set((state) => ({ ...state, user })),
      logout: () => set({ accessToken: null, refreshToken: null, isAuthenticated: false, roles: [], user: null })
    }),
    {
      name: 'auth-storage'
    }
  )
)
