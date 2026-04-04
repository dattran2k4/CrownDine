import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import { EStatus } from '@/types/profile.type'
import { toast } from 'sonner'

export const useToggleStaffStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EStatus }) => 
      http.patch<ApiResponse<any>>(`/admin/staff/${id}/status`, null, { params: { status } }),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staffs'] })
      const actionText = variables.status === EStatus.ACTIVE ? 'Mở khóa' : 'Khóa'
      toast.success(res.data?.message || `${actionText} tài khoản thành công`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái'
      toast.error(message)
    }
  })
}
