import type { ApiResponse, SimpleMessageResponse } from '@/types/utils.type'
import type { CreateWorkScheduleRequest, WorkScheduleRequest, WorkScheduleResponse } from '@/types/workSchedule.type'

import http from '@/utils/http'

const workScheduleApi = {
  getWorkSchedule(data: WorkScheduleRequest) {
    return http.get<ApiResponse<WorkScheduleResponse[]>>('/work-schedules', {
      params: data
    })
  },
  createWorkSchedule(data: CreateWorkScheduleRequest) {
    return http.post<SimpleMessageResponse>('/work-schedules/create', data)
  },
  deleteWorkSchedule(id: string, params?: { deletePattern?: boolean, workDate?: string }) {
    return http.delete<SimpleMessageResponse>(`/work-schedules/${id}`, { params })
  }
}
export default workScheduleApi
