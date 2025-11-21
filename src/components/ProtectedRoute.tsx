import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, Loader2, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that ensures only authenticated non-customer users can access the dashboard
 * - Attempts automatic token refresh before redirecting to login
 * - Only redirects to login if refresh fails
 * - Stores current path for redirect after login
 * - Blocks access if user is a customer
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, logout, silentRefresh } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // Attempt silent refresh if not authenticated and haven't tried yet
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasAttemptedRefresh) {
      setIsRefreshing(true);
      setHasAttemptedRefresh(true);

      // Try to refresh token silently
      silentRefresh()
        .then((success) => {
          if (!success) {
            // Refresh failed - store current path for redirect after login
            const currentPath = location.pathname;
            if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            }
          }
        })
        .catch(() => {
          // Refresh failed - store current path
          const currentPath = location.pathname;
          if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
          }
        })
        .finally(() => {
          setIsRefreshing(false);
        });
    }
  }, [isLoading, isAuthenticated, hasAttemptedRefresh, location.pathname, silentRefresh]);

  // Show loading state while checking authentication or refreshing
  if (isLoading || isRefreshing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isRefreshing ? 'Refreshing session...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // Only redirect to login if refresh has been attempted and still not authenticated
  if (!isAuthenticated && hasAttemptedRefresh) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Block customers from accessing the dashboard
  // Only allow admin, moderator, and inspector roles
  if (user?.role === 'customer') {
    const handleLogout = async () => {
      await logout();
      window.location.href = '/auth/login';
    };

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-center text-muted-foreground">
            You don't have permission to access the dashboard. This area is restricted to administrators and staff only.
          </p>
          <Button onClick={handleLogout} variant="outline" className="mt-4">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // User is authenticated and has appropriate role, render the protected content
  return <>{children}</>;
}
