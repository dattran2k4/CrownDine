import authApi from '@/apis/auth.api'
import { useMutation } from '@tanstack/react-query'

export const useSignup = () => {
  return useMutation({
    mutationFn: authApi.register
  })
}
export default useSignup
