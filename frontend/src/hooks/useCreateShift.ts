import { shiftApi } from '@/apis/shift.api'
import type { createShiftRequest } from '@/types/workSchedule.type'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const useCreateShift = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: createShiftRequest) => shiftApi.createShift(body),
    onSuccess: (res) => {
      if (res.data?.message === 'Created shift successfully') {
        toast.success('Thêm ca làm việc thành công!')
        queryClient.invalidateQueries({ queryKey: ['shifts'] })
      }
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi thêm ca làm việc!')
    }
  })
}

export default useCreateShift
