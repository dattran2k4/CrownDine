import type { ApiResponse } from '@/types/utils.type'

export type AuthResponse = ApiResponse<{
  accessToken: string
  refreshToken: string
}>
