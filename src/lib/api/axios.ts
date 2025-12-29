import axios from 'axios'

// API base URL - can be moved to environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3456/api/v1'
console.log({ API_BASE_URL })

// Extend AxiosRequestConfig to include retry flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean
  }
}

// Token refresh state management
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

/**
 * Process all queued requests after token refresh completes
 * @param error - Error if refresh failed, null if successful
 */
const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve()
    }
  })
  failedQueue = []
}

/**
 * Refresh the access token using the refresh token cookie
 * @returns Promise that resolves when refresh is complete
 */
const refreshAccessToken = async (): Promise<void> => {
  // Use axios directly to avoid triggering the interceptor
  await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
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

// Request interceptor - cookies are automatically included with withCredentials: true
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 Unauthorized with token refresh and retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized - attempt token refresh and retry
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log('🔴 401 Error detected (axios.ts):', originalRequest.url)

      // Skip refresh logic if this IS the refresh endpoint
      if (originalRequest.url?.includes('/auth/refresh')) {
        console.log('🔴 Refresh endpoint itself failed - logging out')
        localStorage.removeItem('user')
        window.dispatchEvent(new CustomEvent('auth-unauthorized'))
        return Promise.reject(error)
      }

      // Prevent infinite retry loops
      if (originalRequest._retry) {
        console.log('🔴 Request already retried - logging out')
        localStorage.removeItem('user')
        window.dispatchEvent(new CustomEvent('auth-unauthorized'))
        return Promise.reject(error)
      }

      // Mark request as retried
      originalRequest._retry = true

      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log('🟡 Refresh in progress - queuing request:', originalRequest.url)
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            console.log('🟢 Retrying queued request:', originalRequest.url)
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      // Start refresh process
      console.log('🟡 Starting token refresh...')
      isRefreshing = true

      try {
        await refreshAccessToken()
        console.log('🟢 Token refresh successful')

        processQueue()

        console.log('🟢 Retrying original request:', originalRequest.url)
        return api(originalRequest)
      } catch (refreshError) {
        console.log('🔴 Token refresh failed:', refreshError)
        processQueue(refreshError)
        localStorage.removeItem('user')
        window.dispatchEvent(new CustomEvent('auth-unauthorized'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 Forbidden (Suspended Account)
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      const errorMessage = (error.response.data as any)?.message || ''
      if (errorMessage.toLowerCase().includes('suspended')) {
        localStorage.removeItem('user')
        window.dispatchEvent(
          new CustomEvent('auth-restricted', { detail: errorMessage })
        )
      }
    }

    return Promise.reject(error)
  }
)

// Types for API responses
export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
