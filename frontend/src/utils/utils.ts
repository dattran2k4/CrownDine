import HttpStatusCode from '@/constants/httpStatusCode.enum'
import type { ErrorResponse } from '@/types/utils.type'
import axios, { AxiosError } from 'axios'

export const generateTimeSlots = (openHour: number, closeHour: number, stepMinutes: number = 30) => {
  const slots = []
  let currentTime = openHour * 60 // Convert to minutes
  const endTime = closeHour * 60

  while (currentTime <= endTime) {
    const h = Math.floor(currentTime / 60)
    const m = currentTime % 60
    // Format HH:mm (e.g., 09:30)
    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    slots.push(timeString)
    currentTime += stepMinutes
  }
  return slots
}

export const addMinutesToTime = (timeStr: string, minutesToAdd: number) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  date.setMinutes(date.getMinutes() + minutesToAdd)

  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  const startDate = new Date()
  startDate.setHours(startHours, startMinutes, 0, 0)

  const endDate = new Date()
  endDate.setHours(endHours, endMinutes, 0, 0)

  // Nếu endTime nhỏ hơn startTime, có thể là qua ngày mới
  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1)
  }

  const diffMs = endDate.getTime() - startDate.getTime()
  return Math.round(diffMs / (1000 * 60)) // Trả về số phút
}

/**
 * Kiểm tra xem một datetime (date + time) có trong quá khứ không
 * @param dateString - Ngày dạng YYYY-MM-DD
 * @param timeString - Giờ dạng HH:mm
 * @returns true nếu datetime trong quá khứ, false nếu trong tương lai hoặc hiện tại
 */
export const isDateTimeInPast = (dateString: string, timeString: string): boolean => {
  const now = new Date()
  const [year, month, day] = dateString.split('-').map(Number)
  const [hours, minutes] = timeString.split(':').map(Number)

  const targetDate = new Date(year, month - 1, day, hours, minutes, 0, 0)

  return targetDate < now
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

const API_BASE = 'http://localhost:8080'
/** Chuẩn hóa URL ảnh: nếu path bắt đầu bằng / hoặc không phải http thì ghép với API_BASE */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  return `${API_BASE}${path}`
}

export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}

export function isAxiosUnauthorizedError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized
}

export function isAxiosErrorConfict<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error) && error.response?.status === HttpStatusCode.Conflict
}

export function isAxiosErrorNotFound<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error) && error.response?.status === HttpStatusCode.NotFound
}

export function isAxiosExpiredTokenError<UnauthorizedError>(error: unknown): error is AxiosError<UnauthorizedError> {
  return isAxiosUnauthorizedError<ErrorResponse>(error) && error.response?.data.error === 'TOKEN_EXPIRED'
}
