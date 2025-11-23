import {
  authMutations,
  authQueries,
  type LoginRequest,
  type RegisterRequest
} from '@/lib/api/queries/auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  status: () => [...authKeys.all, 'status'] as const
}

// Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authQueries.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on 401
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnReconnect: false, // Don't refetch on reconnect
    // Prevent multiple simultaneous calls
    networkMode: 'online'
  })
}

export function useAuthStatus() {
  return useQuery({
    queryKey: authKeys.status(),
    queryFn: () => authQueries.checkAuthStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

// Mutations
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: LoginRequest) =>
      authMutations.login(email, password),
    onSuccess: (user) => {
      // Update user query cache directly - no need to invalidate and refetch
      // This prevents unnecessary /auth/me call after login
      queryClient.setQueryData(authKeys.user(), user)
      // Mark query as fresh to prevent refetch
      queryClient.setQueryData(authKeys.user(), user, {
        updatedAt: Date.now()
      })
    }
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authMutations.logout(),
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all })
      // Note: No localStorage token removal - tokens are in cookies only
    }
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authMutations.register(data)
  })
}

export function useRefreshToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authMutations.refreshToken(),
    onSuccess: (user) => {
      // Update user query cache directly without triggering refetch
      queryClient.setQueryData(authKeys.user(), user, {
        updatedAt: Date.now()
      })
    }
  })
}
