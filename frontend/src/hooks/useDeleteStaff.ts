import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import { toast } from 'sonner'

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => http.delete<ApiResponse<any>>(`/admin/staff/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      toast.success(res.data?.message || 'Xóa nhân viên thành công')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi xóa nhân viên'
      toast.error(message)
    }
  })
}
