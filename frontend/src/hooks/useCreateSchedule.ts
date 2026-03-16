import workScheduleApi from '@/apis/workSchedule.api'
import type { CreateWorkScheduleRequest } from '@/types/workSchedule.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const useCreateSchedule = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateWorkScheduleRequest) => workScheduleApi.createWorkSchedule(body),
    onSuccess: (res) => {
      if (res.data?.message === 'ok') {
        toast.success('Thêm Lịch làm việc thành công!')
        queryClient.invalidateQueries({ queryKey: ['work-schedules'] })
        onSuccessCallback?.()
      }
    },
    onError: () => {
      toast.error('Thêm Lịch làm việc thất bại!')
    }
  })
}

export default useCreateSchedule
