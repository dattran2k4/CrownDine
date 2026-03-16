import { useAuthStore } from '@/stores/useAuthStore'

export function getUserRoles(): string[] {
  return useAuthStore.getState().roles
}

export function isAdmin(): boolean {
  return getUserRoles().includes('ADMIN')
}
