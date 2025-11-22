import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { AuthProvider } from './contexts/AuthContext'
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <AuthProvider>
      <Analytics />
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
