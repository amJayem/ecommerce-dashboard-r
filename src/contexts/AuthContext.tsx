import { useState, useEffect, useCallback, type ReactNode } from "react";
import { authQueries, authMutations, type User } from "@/lib/api/queries/auth";
import { AuthContext } from "./AuthContext.types";
import { toast } from "react-hot-toast";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const isAuthenticated = !!user;

  /**
   * getMe() - Get current user with automatic refresh on 401
   * - Calls GET /auth/me
   * - If 401, calls POST /auth/refresh once, then retries getMe() once
   * - If refresh fails, returns null (logout will be handled by caller)
   */
  const getMe = useCallback(async (): Promise<User | null> => {
    try {
      const userData = await authQueries.getCurrentUser();
      return userData;
    } catch (error) {
      // If we get an error, it means even the refresh attempt failed (or it wasn't a 401)
      console.error("Failed to get current user:", error);
      return null;
    }
  }, []);

  /**
   * initialize() - Initialize auth state on app start
   * - Calls getMe() to check if user is authenticated
   * - Sets user if authenticated, clears if not
   */
  const initialize = useCallback(async () => {
    setIsInitializing(true);
    try {
      const userData = await getMe();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, [getMe]);

  /**
   * login() - Login user and set user state
   */
  const login = useCallback(async (email: string, password: string) => {
    const userData = await authMutations.login(email, password);
    setUser(userData);
  }, []);

  /**
   * logout() - Logout user and clear state
   * Navigation should be handled by the component calling logout
   */
  const logout = useCallback(async () => {
    try {
      await authMutations.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
    } finally {
      setUser(null);
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initialize();

    const handleUnauthorized = () => {
      // Force logout by clearing user state
      setUser(null);
      toast.error("Session expired. Please login again.");
    };

    const handleRestricted = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail || "Access restricted";
      // Force logout by clearing user state
      setUser(null);
      // Ideally show a nice modal, for now using toast as requested
      toast.error(message);
      // Redirect happens automatically if ProtectedRoute checks user state
      // or we can force navigate if needed, but state update usually triggers re-render
    };

    window.addEventListener("auth-unauthorized", handleUnauthorized);
    window.addEventListener("auth-restricted", handleRestricted);

    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
      window.removeEventListener("auth-restricted", handleRestricted);
    };
  }, [initialize]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isInitializing,
        isAuthenticated,
        login,
        logout,
        initialize,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
