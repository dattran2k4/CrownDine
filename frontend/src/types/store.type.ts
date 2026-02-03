import type { User } from './profile.type'

export interface AuthState {
  //state for authentication
  accessToken: string | null
  user: User | null

  setAccessToken: (accessToken: string | null) => void
  setUser: (user: User | null) => void
  clearState: () => void
}
