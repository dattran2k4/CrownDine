import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import type { Staff } from '@/types/profile.type'
import { toast } from 'react-toastify'
import type { CreateStaffValues } from '@/utils/auth.schema'

export default function useCreateStaff() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateStaffValues) => {
            // Create staff endpoint is typically POST /admin/staff
            return http.post<ApiResponse<Staff>>('/admin/staff', data)
        },
        onSuccess: () => {
            toast.success('Thêm nhân viên thành công!')
            // Invalidate the staffs query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['staffs'] })
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi thêm nhân viên'
            toast.error(message)
        }
    })
}
