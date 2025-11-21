import {
    authMutations,
    authQueries,
    type LoginRequest,
    type RegisterRequest
} from "@/lib/api/queries/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
  status: () => [...authKeys.all, "status"] as const,
};

// Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authQueries.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 401
    refetchOnWindowFocus: false,
  });
}

export function useAuthStatus() {
  return useQuery({
    queryKey: authKeys.status(),
    queryFn: () => authQueries.checkAuthStatus(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// Mutations
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: LoginRequest) =>
      authMutations.login(email, password),
    onSuccess: (user) => {
      // Update user query cache
      queryClient.setQueryData(authKeys.user(), user);
      // Invalidate to trigger refetch
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authMutations.logout(),
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      // Clear localStorage
      localStorage.removeItem("user");
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authMutations.register(data),
  });
}

export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authMutations.refreshToken(),
    onSuccess: (user) => {
      // Update user query cache
      queryClient.setQueryData(authKeys.user(), user);
    },
  });
}

