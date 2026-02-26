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

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
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
  return isAxiosUnauthorizedError<ErrorResponse>(error) && error.response?.data.error === 'UNAUTHORIZED'
}
