import authApi from '@/apis/auth.api'
import { useMutation } from '@tanstack/react-query'

export const useVerifyRegister = () => {
    return useMutation({
        mutationFn: authApi.verifyRegister
    })
}
export default useVerifyRegister
