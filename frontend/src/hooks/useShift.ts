import { shiftApi } from '@/apis/shift.api'
import { useQuery } from '@tanstack/react-query'

const useShift = () => {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: () => shiftApi.getAllShifts(),
    select: (res) => res.data?.data || []
  })
}

export default useShift
