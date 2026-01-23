import axios from 'axios'
import { api, type ApiError } from './api/axios'

// Re-export api instance and types
export { api, type ApiError }


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

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'BKASH' | 'CASH_ON_DELIVERY' | 'STRIPE'

export interface ShippingAddress {
  id?: number
  firstName: string
  lastName: string
  street: string
  city: string
  state?: string | null
  zipCode: string
  country: string
  phone: string
  email?: string
  addressType?: string
  isDefault?: boolean
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  price: number
  total: number
  product: {
    id: number
    name: string
    slug: string
    coverImage: string
    price: number
  }
}

export interface Order {
  id: number
  userId: number | null
  guestEmail: string | null
  status: OrderStatus
  totalAmount: number
  subtotal: number
  tax: number
  shippingCost: number
  discount: number
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  shippingAddress: ShippingAddress | null
  billingAddress: ShippingAddress | null
  shippingAddressText: string | null
  deliveryNote: string | null
  estimatedDelivery: string | null
  actualDelivery: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: number
    name: string
    email: string
    phoneNumber: string | null
  }
  items: OrderItem[]
}

export interface OrderQuery {
  search?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  page?: number
  limit?: number
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

// Orders API functions
export const ordersApi = {
  /**
   * Get all orders with pagination and filtering
   */
  async getAll(params?: OrderQuery): Promise<{ orders: Order[], total: number, pages: number }> {
    try {
      const response = await api.get('/orders', { params })
      // The guide doesn't specify the exactly response structure for list, 
      // but usually for paginated list it returns metadata.
      // If it returns a simple array, we can adapt.
      // Assuming a standard paginated response or array based on previous code.
      if (Array.isArray(response.data)) {
        return { orders: response.data, total: response.data.length, pages: 1 }
      }
      return response.data
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      throw new Error('Failed to fetch orders')
    }
  },

  /**
   * Get a single order by ID
   */
  async getById(id: number | string): Promise<Order> {
    try {
      const response = await api.get<Order>(`/orders/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error)
      throw new Error(`Failed to fetch order ${id}`)
    }
  },

  /**
   * Update general order info
   */
  async update(id: number | string, data: Partial<Order>): Promise<Order> {
    try {
      const response = await api.patch<Order>(`/admin/orders/${id}`, data)
      return response.data
    } catch (error) {
      console.error(`Failed to update order ${id}:`, error)
      throw new Error('Failed to update order')
    }
  },

  /**
   * Update order status
   */
  async updateStatus(id: number | string, status: OrderStatus): Promise<Order> {
    try {
      const response = await api.patch<Order>(`/orders/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error(`Failed to update order status ${id}:`, error)
      throw new Error('Failed to update order status')
    }
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: number | string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      const response = await api.patch<Order>(`/orders/${id}/payment-status`, { paymentStatus })
      return response.data
    } catch (error) {
      console.error(`Failed to update payment status ${id}:`, error)
      throw new Error('Failed to update payment status')
    }
  },

  /**
   * Delete/Cancel an order
   */
  async delete(id: number | string): Promise<void> {
    try {
      await api.delete(`/orders/${id}`)
    } catch (error) {
      console.error(`Failed to delete order ${id}:`, error)
      throw new Error('Failed to delete order')
    }
  }
}
