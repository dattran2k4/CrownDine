import { useQuery } from '@tanstack/react-query'
import http from '@/utils/http'
import type { ApiResponse } from '@/types/utils.type'
import type { Staff } from '@/types/profile.type'

const useStaffs = (name?: string) => {
  return useQuery({
    queryKey: ['staffs', name],
    queryFn: () => http.get<ApiResponse<Staff[]>>('/admin/staff/all'),
    select: (res) => res.data?.data || [],
    staleTime: 5 * 60 * 1000 // Cache data for 5 minutes
  })
}

export default useStaffs
