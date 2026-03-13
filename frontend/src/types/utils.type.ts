export interface ApiResponse<Data> {
  status: string | number
  message: string
  data: Data
}

export interface PageResponse<T> {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  data: T[]
}

export interface ErrorResponse {
  timestamp: string
  status: number
  path: string
  error?: string
  message: string
}
export interface SimpleMessageResponse {
  message: string
}
