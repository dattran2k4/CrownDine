import axios, { type AxiosError, type AxiosInstance } from 'axios'
import HttpStatusCode from '@/constants/httpStatusCode.enum'
import { toast } from 'sonner'
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from '@/utils/utils'
import type { ErrorResponse } from '@/types/utils.type'
import { REFRESH_TOKEN_URL } from '@/apis/auth.api'
import type { RefreshTokenResponse } from '@/types/auth.type'
import { useAuthStore } from '@/stores/useAuthStore'

class Http {
  instance: AxiosInstance
  private refreshTokenRequest: Promise<string> | null

  constructor() {
    this.refreshTokenRequest = null
    this.instance = axios.create({
      baseURL: 'http://localhost:8080/api/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        const accessToken = useAuthStore.getState().accessToken
        if (accessToken && config.headers && config.url !== REFRESH_TOKEN_URL) {
          config.headers.Authorization = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (
          ![HttpStatusCode.UnprocessableEntity, HttpStatusCode.Unauthorized].includes(error.response?.status as number)
        ) {
          const data = error.response?.data as { message?: string } | undefined
          const message = data?.message || error.message
          toast.error(message)
        }

        if (isAxiosUnauthorizedError<ErrorResponse>(error)) {
          const config = error.response?.config || { headers: {}, url: '' }
          const { url } = config

          if (isAxiosExpiredTokenError(error) && url !== REFRESH_TOKEN_URL) {
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  setTimeout(() => {
                    this.refreshTokenRequest = null
                  }, 10000)
                })

            return this.refreshTokenRequest.then((accessToken) => {
              return this.instance({
                ...config,
                headers: { ...config.headers, Authorization: `Bearer ${accessToken}` }
              })
            })
          }

          useAuthStore.getState().logout()
          const errorData = error.response?.data as { message?: string } | undefined
          toast.error(errorData?.message || 'Phiên đăng nhập đã hết hạn')
        }

        return Promise.reject(error)
      }
    )
  }

  private handleRefreshToken() {
    const { refreshToken, setAccessToken, logout } = useAuthStore.getState()

    if (!refreshToken) {
      logout()
      throw new Error('No refresh token')
    }

    return this.instance
      .post<RefreshTokenResponse>(
        REFRESH_TOKEN_URL,
        {},
        {
          headers: {
            'X-Refresh-Token': refreshToken
          }
        }
      )
      .then((res) => {
        const { accessToken } = res.data
        setAccessToken(accessToken)
        return accessToken
      })
      .catch((error) => {
        logout()
        throw error
      })
  }
}

export default new Http().instance
