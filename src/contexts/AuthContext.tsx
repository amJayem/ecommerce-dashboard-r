import { useEffect, type ReactNode } from 'react';
import { useCurrentUser, useLogin as useLoginMutation, useLogout as useLogoutMutation } from '@/hooks/useAuthQuery';
import { AuthContext } from './AuthContext.types';

export function AuthProvider({ children }: { children: ReactNode }) {
  // React Query hooks
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  const loginMutation = useLoginMutation();
  const logoutMutation = useLogoutMutation();

  const isAuthenticated = !!user && !error;

  // Sync user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Listen for storage changes (when localStorage is updated from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        // Re-validate when storage changes
        refetch();
      }
    };

    // Listen for custom auth update event (for same-tab updates)
    const handleAuthUpdate = () => {
      refetch();
    };

    // Listen for unauthorized event (when API returns 401)
    const handleUnauthorized = () => {
      // React Query will handle this via the error state
      refetch();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-update', handleAuthUpdate);
    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-update', handleAuthUpdate);
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
    }
    // Navigation is handled by the component calling logout
  };

  const refreshUser = async () => {
    await refetch();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
