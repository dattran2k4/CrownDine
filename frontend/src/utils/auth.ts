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
  localStorage.setItem('accessToken', access_token)
}

export const getAccessTokenFromLC = () => {
  return localStorage.getItem('accessToken')
}

export const clearAccessTokenLS = () => {
  localStorage.removeItem('accessToken')
}
