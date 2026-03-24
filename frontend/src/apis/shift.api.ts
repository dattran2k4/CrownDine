import type { ApiResponse } from '@/types/utils.type'
import type { createShiftRequest, ShiftsResponse } from '@/types/workSchedule.type'
import http from '@/utils/http'

export const shiftApi = {
  getAllShifts: () => {
    return http.get<ApiResponse<ShiftsResponse[]>>('/shifts')
  },
  createShift: (data: createShiftRequest) => {
    return http.post<ApiResponse<ShiftsResponse>>('/shifts', data)
  }
}
