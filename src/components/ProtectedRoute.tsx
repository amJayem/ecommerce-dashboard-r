import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { AlertCircle, Loader2, LogOut } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component that ensures only authenticated non-customer users can access the dashboard
 * - Waits for auth.initialize() to finish before redirecting
 * - Only redirects to login if user is not authenticated after initialization
 * - Stores current path for redirect after login
 * - Blocks access if user is a customer
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Show loading state while initializing (waiting for initialize() to finish)
  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated (after initialization is complete)
  if (!isAuthenticated) {
    // Store current path for redirect after login
    const currentPath = location.pathname
    if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
      sessionStorage.setItem('redirectAfterLogin', currentPath)
    }
    return <Navigate to='/auth/login' state={{ from: location }} replace />
  }

  // Block customers from accessing the dashboard
  // Only allow admin, moderator, and inspector roles
  if (user?.role === 'customer') {
    const handleLogout = async () => {
      await logout()
      navigate('/auth/login', { replace: true })
    }

    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4 max-w-md mx-auto p-6'>
          <AlertCircle className='h-12 w-12 text-destructive' />
          <h1 className='text-2xl font-bold'>Access Denied</h1>
          <p className='text-center text-muted-foreground'>
            You don't have permission to access the dashboard. This area is
            restricted to administrators and staff only.
          </p>
          <Button onClick={handleLogout} variant='outline' className='mt-4'>
            <LogOut className='mr-2 h-4 w-4' />
            Logout
          </Button>
        </div>
      </div>
    )
  }

  // User is authenticated and has appropriate role, render the protected content
  return <>{children}</>
}
