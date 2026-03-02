import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import userApi from '@/apis/user.api'

// We keep the component name AppProvider to prevent breaking main.tsx imports,
// but we no longer use React.createContext since Zustand manages global state.
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('AppProvider: Fetching profile with token:', accessToken)
        const res = await userApi.getProfile(accessToken!)
        if (res.data?.data) {
          setUser(res.data.data)
          console.log('AppProvider: Profile fetched successfully', res.data.data)
        }
      } catch (error) {
        console.error('AppProvider: Failed to fetch profile', error)
        logout()
      }
    }

    if (accessToken && !user) {
      fetchProfile()
    }
  }, [accessToken, user, setUser, logout])

  return <>{children}</>
}
