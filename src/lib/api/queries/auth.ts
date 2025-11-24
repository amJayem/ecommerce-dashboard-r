import { api, type ApiError } from '../axios'
import axios from 'axios'

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

// Helper function to handle API errors
const handleApiError = (error: unknown, fallbackMessage: string): never => {
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
      throw new Error(apiError.message || fallbackMessage)
    }
  }
  throw new Error(fallbackMessage)
}

// Query Functions
export const authQueries = {
  /**
   * Get current logged-in user information
   * Returns user data if authenticated, throws error otherwise
   * This function should be used by getMe() in AuthContext
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<LoginResponse>('/auth/me')
      return response.data.user
    } catch (error) {
      // Re-throw axios errors so getMe() can handle 401 specifically
      if (axios.isAxiosError(error)) {
        throw error
      }
      return handleApiError(error, 'Failed to get user info')
    }
  },

  /**
   * Check authentication status by validating token with backend
   * Returns true if token is valid, false otherwise
   */
  checkAuthStatus: async (): Promise<boolean> => {
    try {
      await api.get('/auth/me')
      return true
    } catch {
      // Token invalid, expired, or not present
      return false
    }
  }
}

// Mutation Functions
export const authMutations = {
  /**
   * Login user with email and password
   * Tokens are automatically stored in HttpOnly cookies
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password
      })
      return response.data.user
    } catch (error) {
      return handleApiError(error, 'Login failed')
    }
  },

  /**
   * Logout user (clears cookies and invalidates refresh token)
   */
  logout: async (): Promise<void> => {
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
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle duplicate email error
        if (error.response.status === 500 || error.response.status === 400) {
          const apiError = error.response.data as ApiError
          if (
            typeof apiError.message === 'string' &&
            apiError.message.includes('email')
          ) {
            throw new Error(
              'This email is already registered. Please use a different email or try logging in.'
            )
          }
        }
      }
      return handleApiError(error, 'Registration failed')
    }
  },

  /**
   * Refresh access token using refresh token from cookie
   * Returns nothing - just sets new cookies
   */
  refreshToken: async (): Promise<void> => {
    await api.post('/auth/refresh')
  }
}
