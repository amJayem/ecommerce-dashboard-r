import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react'
import { usePageTitle } from '@/hooks/use-page-title'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

export function Login() {
  usePageTitle('Login')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/', {
        replace: true
      })
    }
  }, [isAuthenticated, authLoading, navigate])

  // Check for success message from registration
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (
      location.state as {
        message?: string
      }
    )?.message || null
  )

  // Load saved email from localStorage if remember me was checked
  const [email, setEmail] = useState(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    return rememberedEmail || ''
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('rememberedEmail')
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const validateForm = (): boolean => {
    const errors: {
      email?: string
      password?: string
    } = {}

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 6 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const trimmedEmail = email.trim()

      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', trimmedEmail)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      await login(trimmedEmail, password)

      // Get redirect path from sessionStorage (set by ProtectedRoute or axios interceptor)
      // or from location state (set by ProtectedRoute)
      const redirectPath =
        sessionStorage.getItem('redirectAfterLogin') ||
        (
          location.state as {
            from?: {
              pathname: string
            }
          }
        )?.from?.pathname ||
        '/'

      // Clear the redirect path
      sessionStorage.removeItem('redirectAfterLogin')

      // Navigate to the saved path or dashboard
      navigate(redirectPath, {
        replace: true
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(errorMessage)

      // Clear password on error for security
      setPassword('')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center p-12'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl'>Welcome back</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Success Message */}
        {successMessage && (
          <div
            className='rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200
           dark:border-green-800 p-3 flex items-start gap-2'>
            <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-green-800 dark:text-green-200'>
                {successMessage}
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className='text-green-600 dark:text-green-400 hover:text-green-800 
              dark:hover:text-green-200'
              aria-label='Dismiss'>
              ×
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2'>
            <AlertCircle className='h-4 w-4 text-destructive mt-0.5 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-destructive whitespace-pre-line'>
                {error}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium'>
              Email
            </label>
            <div className='relative'>
              <Mail
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4',
                  fieldErrors.email
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              />
              <Input
                id='email'
                type='email'
                placeholder='name@example.com'
                className={cn(
                  'pl-10',
                  fieldErrors.email &&
                    'border-destructive focus-visible:ring-destructive'
                )}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      email: undefined
                    }))
                  }
                }}
                disabled={isLoading}
                required
                autoComplete='email'
              />
            </div>
            {fieldErrors.email && (
              <p className='text-sm text-destructive'>{fieldErrors.email}</p>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <label htmlFor='password' className='text-sm font-medium'>
                Password
              </label>
              <Link
                to='/auth/forgot-password'
                className='text-sm text-primary hover:underline'
                tabIndex={isLoading ? -1 : 0}>
                Forgot password?
              </Link>
            </div>
            <div className='relative'>
              <Lock
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10',
                  fieldErrors.password
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              />
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                className={cn(
                  'pl-10 pr-10',
                  fieldErrors.password &&
                    'border-destructive focus-visible:ring-destructive'
                )}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined
                    }))
                  }
                }}
                disabled={isLoading}
                required
                minLength={4}
                autoComplete='current-password'
              />
              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7'
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {fieldErrors.password && (
              <p className='text-sm text-destructive'>{fieldErrors.password}</p>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <input
              id='remember'
              type='checkbox'
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className='h-4 w-4 rounded-sm border-2 border-gray-300 bg-white text-black cursor-pointer transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-black checked:border-black checked:text-white'
            />
            <Label
              htmlFor='remember'
              className='text-sm font-medium leading-none cursor-pointer select-none'>
              Remember me
            </Label>
          </div>

          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className='mr-2 h-4 w-4' />
                Sign In
              </>
            )}
          </Button>
        </form>

        <p className='text-center text-sm text-muted-foreground'>
          Don't have an account?{' '}
          <Link
            to='/auth/register'
            className='text-primary hover:underline font-medium'
            tabIndex={isLoading ? -1 : 0}>
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
