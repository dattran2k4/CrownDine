import type { AuthResponse } from '@/types/auth.type'
import { clearAccessTokenLS, getAccessTokenFromLC, setAccessTokenToLC } from '@/utils/auth'
import axios, { type AxiosInstance } from 'axios'

class Http {
  instance: AxiosInstance
  private accessToken: string

  constructor() {
    this.accessToken = getAccessTokenFromLC() || ''
    this.instance = axios.create({
      baseURL: 'http://localhost:8080/api/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
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
        if (url === 'auth/login' || url === 'auth/register') {
          this.accessToken = data.accessToken
          setAccessTokenToLC(this.accessToken)
        } else if (url === '/auth/logout') {
          clearAccessTokenLS()
          this.accessToken = ''
        }
        return response
      },
      (error) => Promise.reject(error)
    )
  }
}
export default new Http().instance
