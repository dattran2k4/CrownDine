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
                    const decoded = jwtDecode<{ authorities?: string[] }>(accessToken)
                    set((state) => ({
                        ...state,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                        roles: decoded.authorities || []
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
