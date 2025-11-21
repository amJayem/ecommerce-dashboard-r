import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, UserPlus, AlertCircle, Loader2, MapPin, Phone } from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"
import { useRegister, useLogin } from "@/hooks/useAuthQuery"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

export function Register() {
  usePageTitle("Register")
  const navigate = useNavigate()
  
  // Check if user is already authenticated via AuthContext
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  useEffect(() => {
    // Redirect if already authenticated
    if (!authLoading && isAuthenticated) {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/"
      sessionStorage.removeItem("redirectAfterLogin")
      navigate(redirectPath, { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // React Query mutations
  const registerMutation = useRegister()
  const loginMutation = useLogin()
  
  const isLoading = registerMutation.isPending || loginMutation.isPending
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    email?: string
    address?: string
    phoneNumber?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {}

    // Name validation
    if (!name.trim()) {
      errors.name = "Full name is required"
    }

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address"
    }

    // Address validation
    if (!address.trim()) {
      errors.address = "Address is required"
    }

    // Phone number validation (optional but validate format if provided)
    if (phoneNumber.trim() && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Please enter a valid phone number (E.164 format recommended)"
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    // Terms validation
    if (!termsAccepted) {
      setError("You must agree to the Terms of Service and Privacy Policy")
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0 && termsAccepted
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!validateForm()) {
      return
    }

    try {
      const registerData = {
        email: email.trim(),
        name: name.trim(),
        address: address.trim(),
        password,
        ...(phoneNumber.trim() && { phoneNumber: phoneNumber.trim() }),
      }

      await registerMutation.mutateAsync(registerData)
      
      // After successful registration, automatically log in the user
      try {
        await loginMutation.mutateAsync({ email: email.trim(), password })
        
        // Trigger a custom event to notify AuthContext
        window.dispatchEvent(new Event('auth-update'))
        
        // Small delay to ensure state updates, then navigate
        setTimeout(() => {
          navigate("/", { replace: true })
        }, 100)
      } catch (loginError) {
        console.log("login error", loginError)
        // If auto-login fails, redirect to login page
        navigate("/auth/login", { 
          state: { 
            message: "Registration successful! Please log in with your credentials." 
          } 
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed. Please try again."
      setError(errorMessage)
      
      // Clear passwords on error for security
      setPassword("")
      setConfirmPassword("")
    } 
    // finally {
    //   setIsLoading(false)
    // }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create a new account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <div className="relative">
              <User className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                fieldErrors.name ? "text-destructive" : "text-muted-foreground"
              )} />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className={cn(
                  "pl-10",
                  fieldErrors.name && "border-destructive focus-visible:ring-destructive"
                )}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }))
                  }
                }}
                disabled={isLoading}
                required
                autoComplete="name"
              />
            </div>
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                fieldErrors.email ? "text-destructive" : "text-muted-foreground"
              )} />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className={cn(
                  "pl-10",
                  fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                )}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <div className="relative">
              <MapPin className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                fieldErrors.address ? "text-destructive" : "text-muted-foreground"
              )} />
              <Input
                id="address"
                type="text"
                placeholder="123 Main Street, City, Country"
                className={cn(
                  "pl-10",
                  fieldErrors.address && "border-destructive focus-visible:ring-destructive"
                )}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  if (fieldErrors.address) {
                    setFieldErrors((prev) => ({ ...prev, address: undefined }))
                  }
                }}
                disabled={isLoading}
                required
                autoComplete="street-address"
              />
            </div>
            {fieldErrors.address && (
              <p className="text-sm text-destructive">{fieldErrors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number <span className="text-muted-foreground">(Optional)</span>
            </label>
            <div className="relative">
              <Phone className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                fieldErrors.phoneNumber ? "text-destructive" : "text-muted-foreground"
              )} />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+12025550173"
                className={cn(
                  "pl-10",
                  fieldErrors.phoneNumber && "border-destructive focus-visible:ring-destructive"
                )}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value)
                  if (fieldErrors.phoneNumber) {
                    setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                  }
                }}
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>
            {fieldErrors.phoneNumber && (
              <p className="text-sm text-destructive">{fieldErrors.phoneNumber}</p>
            )}
            <p className="text-xs text-muted-foreground">
              E.164 format recommended (e.g., +12025550173)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                fieldErrors.password ? "text-destructive" : "text-muted-foreground"
              )} />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                className={cn(
                  "pl-10",
                  fieldErrors.password && "border-destructive focus-visible:ring-destructive"
                )}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }
                  // Clear confirm password error if passwords now match
                  if (fieldErrors.confirmPassword && e.target.value === confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
                disabled={isLoading}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-sm text-destructive">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                fieldErrors.confirmPassword ? "text-destructive" : "text-muted-foreground"
              )} />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className={cn(
                  "pl-10",
                  fieldErrors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                )}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
                disabled={isLoading}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => {
                setTermsAccepted(e.target.checked)
                if (error && error.includes("Terms")) {
                  setError(null)
                }
              }}
              disabled={isLoading}
              required
              className="h-4 w-4 rounded-sm border-2 border-gray-300 bg-white text-black cursor-pointer transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-black checked:border-black checked:text-white mt-1"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <Link 
                to="/auth/terms" 
                className="text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link 
                to="/auth/privacy" 
                className="text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link 
            to="/auth/login" 
            className="text-primary hover:underline font-medium"
            tabIndex={isLoading ? -1 : 0}
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
