import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'

class Http {
  instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: 'http://localhost:8080/api/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.instance.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().accessToken
        if (token && config.headers) {
          config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== 'auth/refresh-token') {
          originalRequest._retry = true
          try {
            const refreshToken = useAuthStore.getState().refreshToken
            if (!refreshToken) {
              useAuthStore.getState().logout()
              return Promise.reject(error)
            }

            const res = await axios.post(`http://localhost:8080/api/auth/refresh-token?refreshToken=${refreshToken}`)
            const { accessToken, refreshToken: newRefreshToken } = res.data

            useAuthStore.getState().setAuth(accessToken, newRefreshToken)

            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return this.instance(originalRequest)
          } catch (refreshError) {
            useAuthStore.getState().logout()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }
}
export default new Http().instance
