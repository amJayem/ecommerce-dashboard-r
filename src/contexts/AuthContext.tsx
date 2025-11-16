import { useState, useEffect, type ReactNode } from 'react';
import { authApi, type User } from '@/lib/api';
import { AuthContext } from './AuthContext.types';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Validate authentication with backend on mount
  useEffect(() => {
    const validateAuth = async () => {
      setIsLoading(true);

      // First, try to get user from localStorage (for quick UI render)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      // Then validate with backend - this is the critical step
      // Never rely solely on localStorage to determine authentication status
      try {
        // Use /auth/me to get fresh user data and validate authentication
        // This is better than refreshToken because it doesn't refresh tokens unnecessarily
        const userData = await authApi.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        // Update localStorage with fresh user data (ensures role and other fields are up-to-date)
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        // Token invalid, expired, or not present - clear everything
        console.error('Auth validation failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();

    // Listen for storage changes (when localStorage is updated from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        // Re-validate when storage changes
        validateAuth();
      }
    };

    // Listen for custom auth update event (for same-tab updates)
    const handleAuthUpdate = () => {
      validateAuth();
    };

    // Listen for unauthorized event (when API returns 401)
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-update', handleAuthUpdate);
    window.addEventListener('auth-unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-update', handleAuthUpdate);
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const userData = await authApi.login(email, password);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    // Navigation is handled by the component calling login
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      // Navigation is handled by the component calling logout
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, user might be logged out
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
