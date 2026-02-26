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

export const setAccessTokenToLC = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken)
}

export const setRefreshTokenToLC = (refreshToken: string) => {
  localStorage.setItem('refreshToken', refreshToken)
}

export const getRefreshTokenFromLC = () => {
  return localStorage.getItem('refreshToken')
}

export const getAccessTokenFromLC = () => {
  return localStorage.getItem('accessToken')
}

export const clearLS = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}
