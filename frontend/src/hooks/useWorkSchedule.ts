import workScheduleApi from '@/apis/workSchedule.api'
import type { WorkScheduleRequest } from '@/types/workSchedule.type'
import { useQuery } from '@tanstack/react-query'

const useWorkSchedule = (params: WorkScheduleRequest) => {
  return useQuery({
    queryKey: ['work-schedules', params],
    queryFn: () => workScheduleApi.getWorkSchedule(params),
    select: (res) => res.data?.data || [],
    staleTime: 5 * 60 * 1000 // Cache data for 5 minutes
  })
}

export default useWorkSchedule
