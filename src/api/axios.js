import axios from 'axios'
import toast from 'react-hot-toast'

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://backend-production-c10e.up.railway.app')
  .replace(/\/$/, '')
  .replace(/\/api$/, '')

const api = axios.create({
  baseURL: `${apiBase}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Don't retry if it's already a retry or not a 401
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    const refreshToken = localStorage.getItem('refresh_token')

    if (!refreshToken) {
      // No refresh token, redirect to login
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const res = await axios.post(`${apiBase}/api/auth/token/refresh/`, { 
        refresh: refreshToken 
      })
      
      localStorage.setItem('access_token', res.data.access)
      originalRequest.headers.Authorization = `Bearer ${res.data.access}`
      return api(originalRequest)
      
    } catch (refreshError) {
      // Refresh failed - clear tokens and redirect
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      if (!refreshError.response) {
        toast.error('No internet connection. Please check your network.')
      } else {
        toast.error('Session expired. Please login again.')
      }
      
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }
  },
)

export default api