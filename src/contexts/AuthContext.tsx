import { useEffect, useState, type ReactNode } from 'react';
import { useCurrentUser, useLogin as useLoginMutation, useLogout as useLogoutMutation } from '@/hooks/useAuthQuery';
import { AuthContext } from './AuthContext.types';

export function AuthProvider({ children }: { children: ReactNode }) {
  // React Query hooks
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  // Track if we've attempted initial load
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  
  // User is authenticated if we have user data and no error
  // But don't mark as unauthenticated until we've attempted to load
  const isAuthenticated = hasAttemptedLoad ? (!!user && !error) : isLoading;

  // Attempt to load user on mount
  useEffect(() => {
    if (!hasAttemptedLoad) {
      setHasAttemptedLoad(true);
      // The useCurrentUser hook will automatically attempt to fetch
      // We don't need to manually call refetch here
    }
  }, [hasAttemptedLoad]);

  // Listen for unauthorized event (when token refresh fails)
  useEffect(() => {
    const handleUnauthorized = () => {
      // Clear user data from React Query cache
      // The query will automatically refetch and fail, setting error state
      refetch();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, [refetch]);

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
    // React Query will automatically update the user query cache
    // Navigation is handled by the component calling login
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // React Query will automatically clear the user query cache
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
    }
    // Navigation is handled by the component calling logout
  };

  const refreshUser = async () => {
    await refetch();
  };

  // Silent refresh function for interceptor use
  const silentRefresh = async () => {
    try {
      await refetch();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
        silentRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
