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
