import { jwtDecode } from 'jwt-decode'

type JwtPayload = {
  authorities?: string[]
  exp?: number
}

export function getUserRoles(): string[] {
  const token = localStorage.getItem('accessToken')
  if (!token) return []

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return decoded.authorities ?? []
  } catch {
    return []
  }
}

export function isAdmin(): boolean {
  return getUserRoles().includes('ADMIN')
}

export const setAccessTokenToLC = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}

export const getAccessTokenFromLC = () => {
  return localStorage.getItem('access_token')
}

export const clearAccessTokenLS = () => {
  localStorage.removeItem('access_token')
}
export const getUserFromLC = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Lỗi khi parse User từ LocalStorage:', error)
    return null
  }
}
