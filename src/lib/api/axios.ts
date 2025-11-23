import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

// API base URL - can be moved to environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3456/api/v1'

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false
let refreshPromise: Promise<void> | null = null
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

// Process queued requests after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: Required for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout to prevent hanging requests
})

// Note: Request deduplication is handled by React Query at the query level
// Axios AbortController support is provided for React Query's cancellation

// Request interceptor - no token injection needed (cookies are automatic)
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included with withCredentials: true
    // React Query will provide AbortController signal if needed for cancellation
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Don't process aborted requests (cancelled by React Query)
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Handle 401 Unauthorized errors
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Skip refresh for /auth/refresh endpoint itself to prevent infinite loops
      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error)
      }

      // If we're already refreshing, queue this request
      if (isRefreshing && refreshPromise) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            // Retry the original request after token refresh
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      // Create a single refresh promise that all queued requests will wait for
      refreshPromise = (async () => {
        try {
          // Attempt to refresh the token
          await api.post('/auth/refresh')

          // Refresh successful, process queued requests
          processQueue(null, null)
          isRefreshing = false
          refreshPromise = null
        } catch (refreshError) {
          // Refresh failed - user needs to login again
          isRefreshing = false
          refreshPromise = null
          processQueue(new Error('Token refresh failed'), null)

          // Store current path for redirect after login
          const currentPath = window.location.pathname
          if (
            currentPath !== '/auth/login' &&
            currentPath !== '/auth/register'
          ) {
            sessionStorage.setItem('redirectAfterLogin', currentPath)
          }

          // Clear any user data from memory (handled by AuthContext)
          window.dispatchEvent(new CustomEvent('auth-unauthorized'))

          // Redirect to login
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login'
          }

          throw refreshError
        }
      })()

      // Queue this request to retry after refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          // Retry the original request after token refresh
          return api(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    // For non-401 errors, reject immediately
    return Promise.reject(error)
  }
)

// Types for API responses
export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
