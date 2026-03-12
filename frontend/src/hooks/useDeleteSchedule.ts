import workScheduleApi from '@/apis/workSchedule.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const useDeleteSchedule = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, deletePattern, workDate }: { id: string; deletePattern?: boolean; workDate?: string }) =>
            workScheduleApi.deleteWorkSchedule(id, { deletePattern, workDate }),
        onSuccess: () => {
            // Invalidate both work-schedules and templates if needed
            queryClient.invalidateQueries({ queryKey: ['work-schedules'] })
        }
    })
}

export default useDeleteSchedule
