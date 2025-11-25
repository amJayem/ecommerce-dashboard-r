import axios from 'axios'

// API base URL - can be moved to environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3456/api/v1'
console.log({ API_BASE_URL })

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // IMPORTANT: Required for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add response interceptor to handle 401 Unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 Unauthorized, clear auth state
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Clear localStorage
      localStorage.removeItem('user')
      // Dispatch custom event to notify AuthContext
      window.dispatchEvent(new CustomEvent('auth-unauthorized'))
    }
    return Promise.reject(error)
  }
)

// Types for API responses
export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  address: string | null
  avatarUrl: string | null
  isVerified: boolean
  phoneNumber: string | null
  createdAt: string
}

export interface LoginResponse {
  user: User
}

export interface RegisterRequest {
  email: string
  name: string
  address: string
  password: string
  phoneNumber?: string
  avatarUrl?: string
  isVerified?: boolean
  role?: string
}

export interface RegisterResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}

// Auth API functions
export const authApi = {
  /**
   * Login user with email and password
   * Tokens are automatically stored in HttpOnly cookies
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password
      })
      return response.data.user
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle CORS errors
        if (!error.response && error.message.includes('Network Error')) {
          throw new Error(
            'CORS Error: Backend server may not be running or CORS is not configured. ' +
              'Please ensure:\n' +
              '1. Backend server is running on http://localhost:3456\n' +
              '2. CORS_ORIGINS includes your frontend URL (e.g., http://localhost:5173)\n' +
              '3. Backend allows credentials in CORS configuration'
          )
        }

        if (error.response) {
          const apiError = error.response.data as ApiError
          // Handle different error types
          if (Array.isArray(apiError.message)) {
            throw new Error(apiError.message.join(', '))
          }
          throw new Error(apiError.message || 'Login failed')
        }
      }
      throw new Error('Network error. Please check your connection.')
    }
  },

  /**
   * Logout user (clears cookies and invalidates refresh token)
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error)
    }
  },

  /**
   * Register a new user
   * Tokens are returned in response body (not cookies)
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle CORS errors
        if (!error.response && error.message.includes('Network Error')) {
          throw new Error(
            'CORS Error: Backend server may not be running or CORS is not configured. ' +
              'Please ensure:\n' +
              '1. Backend server is running on http://localhost:3456\n' +
              '2. CORS_ORIGINS includes your frontend URL (e.g., http://localhost:5173)\n' +
              '3. Backend allows credentials in CORS configuration'
          )
        }

        if (error.response) {
          const apiError = error.response.data as ApiError
          // Handle duplicate email error
          if (error.response.status === 500 || error.response.status === 400) {
            if (
              typeof apiError.message === 'string' &&
              apiError.message.includes('email')
            ) {
              throw new Error(
                'This email is already registered. Please use a different email or try logging in.'
              )
            }
          }
          // Handle different error types
          if (Array.isArray(apiError.message)) {
            throw new Error(apiError.message.join(', '))
          }
          throw new Error(apiError.message || 'Registration failed')
        }
      }
      throw new Error('Network error. Please check your connection.')
    }
  },

  /**
   * Refresh access token using refresh token from cookie
   */
  async refreshToken(): Promise<User> {
    try {
      const response = await api.post<LoginResponse>('/auth/refresh')
      return response.data.user
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Token refresh failed'
        )
      }
      throw new Error('Token refresh failed')
    }
  },

  /**
   * Get current logged-in user information
   * Returns user data if authenticated, throws error otherwise
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<LoginResponse>('/auth/me')
      return response.data.user
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(', ')
            : apiError.message || 'Failed to get user info'
        )
      }
      throw new Error('Failed to get user info')
    }
  },

  /**
   * Check authentication status by validating token with backend
   * Returns true if token is valid, false otherwise
   * This should be used instead of checking localStorage alone
   */
  async checkAuthStatus(): Promise<boolean> {
    try {
      // Use refresh endpoint to validate token
      // await api.post('/auth/refresh');
      // Use /auth/me endpoint to validate token and get user
      // If token is valid, this will succeed
      await api.get('/auth/me')
      return true
    } catch {
      // Token invalid, expired, or not present
      return false
    }
  }
}
