import axios from 'axios'

// API base URL - can be moved to environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3456/api/v1'

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
    // Cookies are automatically included with withCredentials: true
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - no automatic refresh (handled by getMe() in AuthContext)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just pass through errors - refresh logic is handled in AuthContext.getMe()
    return Promise.reject(error)
  }
)

// Types for API responses
export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
