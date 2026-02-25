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
        const { accessToken } = useAuthStore.getState()
        if (accessToken && config.headers) {
          config.headers.Authorization = accessToken.startsWith('Bearer ') 
            ? accessToken 
            : `Bearer ${accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
        }
        return Promise.reject(error)
      }
    )
  }
}
export default new Http().instance
