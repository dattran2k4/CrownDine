import type { ApiResponse } from '@/types/utils.type'
import type { ShiftsResponse } from '@/types/workSchedule.type'
import http from '@/utils/http'

export const shiftApi = {
  getAllShifts: () => {
    return http.get<ApiResponse<ShiftsResponse[]>>('/shifts')
  }
}
