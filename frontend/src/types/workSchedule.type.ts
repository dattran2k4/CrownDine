import type { EGender } from './profile.type'

export enum EWorkScheduleStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}
export type WorkScheduleRequest = {
  fromDate?: string
  toDate?: string
  date?: string
  status?: EWorkScheduleStatus
  userId?: number
  shiftId?: number
}
export type WorkScheduleResponse = {
  id: number
  note: string | null
  status: EWorkScheduleStatus
  workDate: string
  repeatGroupId?: string
  user: {
    id: number
    fullName: string
    gender: EGender
    avatarUrl: string | null
  }
  shift: ShiftsResponse
}
export type CreateWorkScheduleRequest = {
  staffIds: number[]
  shiftId: number
  workDate: string
  endDate?: string
  repeatWeekly: boolean
  daysOfWeek: number[] // 0-6 for Sunday-Saturday
  applyToOthersStaff: boolean
  otherStaffIds?: number[] // Required if applyToOthersStaff is true
}
export type ShiftsResponse = {
  id: number
  name: string
  startTime: string
  endTime: string
}
export type createShiftRequest = {
  name: string
  startTime: string
  endTime: string
}
