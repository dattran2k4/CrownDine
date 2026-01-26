export interface ApiResponse<Data> {
  status: string | number
  message: string
  data?: Data
}

export interface ErrorResponse {
  timestamp: string
  status: number
  path: string
  error?: string
  message: string
}
