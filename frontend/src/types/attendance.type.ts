/** Trạng thái chấm công (khớp backend EAttendanceStatus) */
export type EAttendanceStatus =
  | 'ON_TIME'       // Đúng giờ
  | 'LATE_EARLY'    // Đi muộn / Về sớm
  | 'MISSING_PUNCH' // Chấm công thiếu
  | 'NOT_PUNCHED'   // Chưa chấm công
  | 'ABSENT_OFF'    // Nghỉ làm

/** Hình thức chấm công (khớp backend EAttendanceType) */
export type EAttendanceType =
  | 'WORKING'                 // Đi làm
  | 'LEAVE_WITH_PERMISSION'   // Nghỉ có phép
  | 'LEAVE_WITHOUT_PERMISSION' // Nghỉ không phép

export interface ShiftResponse {
  id: number
  name: string
  startTime: string
  endTime: string
}

export interface AttendanceScheduleEmployeeResponse {
  userId: number
  staffCode: string
  fullName: string
  status: string
}

export interface AttendanceScheduleCellResponse {
  shiftId: number
  workDate: string
  dayOfWeek: string
  dateShort: string
  employees: AttendanceScheduleEmployeeResponse[]
}

export interface AttendanceScheduleResponse {
  weekStart: string
  weekEnd: string
  weekNumber: number
  year: number
  shifts: ShiftResponse[]
  cells: AttendanceScheduleCellResponse[]
}

export interface EmployeeAttendanceSummaryResponse {
  userId: number
  staffCode: string
  fullName: string
  workShiftCount: number
  workHoursTotal: string
  leaveShiftCount: number
  lateCount: number
  lateDuration: string
  earlyLeaveCount: number
  earlyLeaveDuration: string
  overtime: string
  noData: boolean
}

export interface AttendanceSummaryResponse {
  periodLabel: string
  employees: EmployeeAttendanceSummaryResponse[]
}

export interface AttendanceHistoryItemResponse {
  id: number
  time: string
  status: EAttendanceStatus
  content: string | null
}

/** Spring Page format từ backend */
export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface EmployeeAttendanceInfoResponse {
  userId: number
  staffCode: string
  fullName: string
  currentStatus: EAttendanceStatus
}

export interface AttendanceRecordRequest {
  userId: number
  workDate: string
  shiftId: number
  note?: string
  attendanceType: EAttendanceType
  hasPunchIn?: boolean
  hasPunchOut?: boolean
  checkInAt?: string
  checkOutAt?: string
}

export const ATTENDANCE_STATUS_LABELS: Record<EAttendanceStatus, string> = {
  ON_TIME: 'Đúng giờ',
  LATE_EARLY: 'Đi muộn / Về sớm',
  MISSING_PUNCH: 'Chấm công thiếu',
  NOT_PUNCHED: 'Chưa chấm công',
  ABSENT_OFF: 'Nghỉ làm'
}

export const ATTENDANCE_STATUS_COLORS: Record<EAttendanceStatus, string> = {
  ON_TIME: 'bg-blue-500',
  LATE_EARLY: 'bg-purple-500',
  MISSING_PUNCH: 'bg-red-500',
  NOT_PUNCHED: 'bg-amber-500',
  ABSENT_OFF: 'bg-gray-400'
}

export const ATTENDANCE_TYPE_LABELS: Record<EAttendanceType, string> = {
  WORKING: 'Đi làm',
  LEAVE_WITH_PERMISSION: 'Nghỉ có phép',
  LEAVE_WITHOUT_PERMISSION: 'Nghỉ không phép'
}
