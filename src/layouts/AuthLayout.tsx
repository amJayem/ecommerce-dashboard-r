import { Outlet, Link } from "react-router-dom"
import { ShoppingBag } from "lucide-react"

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:bg-gradient-to-br from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700">
        <div className="flex h-full flex-col justify-center p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="h-8 w-8" />
              <h1 className="text-3xl font-bold">eCommerce</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to your Dashboard
            </h2>
            <p className="text-teal-50 text-lg">
              Manage your store, track orders, and grow your business with our
              powerful admin dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex flex-1 flex-col justify-center p-8 lg:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">eCommerce</span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

