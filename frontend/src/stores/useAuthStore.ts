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
  setUser: (user: User) => void
  logout: () => void
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
        try {
          const decoded = jwtDecode<{ authorities?: string[], role?: string[] }>(accessToken)
          
          let extractedRoles: string[] = []
          if (decoded.authorities && Array.isArray(decoded.authorities)) {
            extractedRoles = decoded.authorities;
          } else if (decoded.role && Array.isArray(decoded.role) && decoded.role.length > 0) {
            // Spring Security might serialize the role array into a single string element like:
            // "[STAFF, FactorGrantedAuthority ...]"
            const roleStr = String(decoded.role[0]);
            if (roleStr.includes('ADMIN')) extractedRoles.push('ADMIN');
            if (roleStr.includes('STAFF')) extractedRoles.push('STAFF');
          }

          set((state) => ({
            ...state,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            roles: extractedRoles
          }))
        } catch {
          set((state) => ({ ...state, accessToken, refreshToken, isAuthenticated: true, roles: [] }))
        }
      },
      setUser: (user: User) => set((state) => ({ ...state, user })),
      logout: () => set({ accessToken: null, refreshToken: null, isAuthenticated: false, roles: [], user: null })
    }),
    {
      name: 'auth-storage'
    }
  )
)
