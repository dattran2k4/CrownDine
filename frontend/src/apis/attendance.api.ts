import type { ApiResponse } from '@/types/utils.type'
import type {
  AttendanceRecordRequest,
  AttendanceScheduleResponse,
  AttendanceSummaryResponse,
  AttendanceHistoryItemResponse,
  EmployeeAttendanceInfoResponse,
  SpringPage,
  ShiftResponse
} from '@/types/attendance.type'
import http from '@/utils/http'

const ATTENDANCE_URL = '/attendances'
const SHIFT_URL = '/shifts'

const attendanceApi = {
  getWeeklySchedule(params?: { date?: string; search?: string }) {
    return http.get<ApiResponse<AttendanceScheduleResponse>>(`${ATTENDANCE_URL}/schedule`, {
      params: { ...(params?.date && { date: params.date }), ...(params?.search && { search: params.search }) }
    })
  },

  getAttendanceSummary(params?: { date?: string; search?: string }) {
    return http.get<ApiResponse<AttendanceSummaryResponse>>(`${ATTENDANCE_URL}/summary`, {
      params: { ...(params?.date && { date: params.date }), ...(params?.search && { search: params.search }) }
    })
  },

  getHistory(userId: number, page = 0, size = 10) {
    return http.get<ApiResponse<SpringPage<AttendanceHistoryItemResponse>>>(
      `${ATTENDANCE_URL}/history/${userId}`,
      { params: { page, size } }
    )
  },

  getEmployeeInfo(userId: number) {
    return http.get<ApiResponse<EmployeeAttendanceInfoResponse>>(
      `${ATTENDANCE_URL}/employee/${userId}/info`
    )
  },

  saveRecord(body: AttendanceRecordRequest) {
    return http.post<ApiResponse<unknown>>(`${ATTENDANCE_URL}/record`, body)
  },

  getAllShifts() {
    return http.get<ApiResponse<ShiftResponse[]>>(SHIFT_URL)
  }
}

export default attendanceApi
