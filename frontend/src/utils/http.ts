import axios, { type AxiosError, type AxiosInstance } from 'axios'
import {
  clearLS,
  getAccessTokenFromLC,
  getRefreshTokenFromLC,
  setAccessTokenToLC,
  setRefreshTokenToLC
} from '@/utils/auth'
import HttpStatusCode from '@/constants/httpStatusCode.enum'
import { toast } from 'sonner'
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from '@/utils/utils'
import type { ErrorResponse } from '@/types/utils.type'
import { LOGIN_URL, LOGOUT_URL, REFRESH_TOKEN_URL } from '@/apis/auth.api'
import type { RefreshTokenResponse } from '@/types/auth.type'

class Http {
  instance: AxiosInstance
  private accessToken: string
  private refreshToken: string
  private refreshTokenRequest: Promise<string> | null

  constructor() {
    this.accessToken = getAccessTokenFromLC() || ''
    this.refreshToken = getRefreshTokenFromLC() || ''
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
        if (this.accessToken && config.headers && config.url !== REFRESH_TOKEN_URL) {
          config.headers.Authorization = this.accessToken.startsWith('Bearer ')
            ? this.accessToken
            : `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = response.data as any
        if (url === LOGIN_URL) {
          this.accessToken = data.accessToken
          this.refreshToken = data.refreshToken
          setAccessTokenToLC(this.accessToken)
          setRefreshTokenToLC(this.refreshToken)
        } else if (url === LOGOUT_URL) {
          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
        }
        return response
      },
      // (error) => {
      //   if (error.response?.status === 401) {
      //     useAuthStore.getState().logout()
      //   }
      //   return Promise.reject(error)
      // },
      (error: AxiosError) => {
        // Chỉ toast lỗi không phải 422 và 401
        if (
          ![HttpStatusCode.UnprocessableEntity, HttpStatusCode.Unauthorized].includes(error.response?.status as number)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data
          const message = data?.message || error.message
          toast.error(message)
        }

        // Lỗi Unauthorized (401) có rất nhiều trường hợp
        // - Token không đúng
        // - Không truyền token
        // - Token hết hạn*

        // Nếu là lỗi 401
        if (isAxiosUnauthorizedError<ErrorResponse>(error)) {
          console.log('401 detected')
          console.log(error.response?.data)
          const config = error.response?.config || { headers: {}, url: '' }
          const { url } = config
          // Trường hợp Token hết hạn và request đó không phải là của request refresh token
          // thì chúng ta mới tiến hành gọi refresh token
          if (isAxiosExpiredTokenError(error) && url !== REFRESH_TOKEN_URL) {
            console.log('TOKEN EXPIRED')
            // Hạn chế gọi 2 lần handleRefreshToken
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                // Giữ refreshTokenRequest trong 10s cho những request tiếp theo nếu có 401 thì dùng
                setTimeout(() => {
                  this.refreshTokenRequest = null
                }, 10000)
              })
            return this.refreshTokenRequest.then((access_token) => {
              // Nghĩa là chúng ta tiếp tục gọi lại request cũ vừa bị lỗi
              return this.instance({
                ...config,
                headers: { ...config.headers, Authorization: `Bearer ${access_token}` }
              })
            })
          }

          // Còn những trường hợp như token không đúng
          // không truyền token,
          // token hết hạn nhưng gọi refresh token bị fail
          // thì tiến hành xóa local storage và toast message

          clearLS()
          this.accessToken = ''
          this.refreshToken = ''
          toast.error(error.response?.data.message || error.response?.data.message)
          // window.location.reload()
        }

        return Promise.reject(error)
      }
    )
  }
  private handleRefreshToken() {
    console.log('=== CALL REFRESH TOKEN ===')
    console.log('refreshToken:', this.refreshToken)
    if (!this.refreshToken) {
      clearLS()
      throw new Error('No refresh token')
    }
    return this.instance
      .post<RefreshTokenResponse>(
        REFRESH_TOKEN_URL,
        {},
        {
          headers: {
            'X-Refresh-Token': this.refreshToken
          }
        }
      )
      .then((res) => {
        const { accessToken } = res.data
        setAccessTokenToLC(accessToken)
        this.accessToken = accessToken
        return accessToken
      })
      .catch((error) => {
        console.log('REFRESH FAILED')
        console.log(error.response?.data)
        clearLS()
        this.accessToken = ''
        this.refreshToken = ''
        throw error
      })
  }
}
export default new Http().instance
