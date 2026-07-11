import axios from 'axios'

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://backend-production-c10e.up.railway.app').replace(/\/$/, '').replace(/\/api$/, '')

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const res = await axios.post(`${apiBase}/api/auth/token/refresh/`, { refresh: refreshToken })
          localStorage.setItem('access_token', res.data.access)
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  },
)

export default api
