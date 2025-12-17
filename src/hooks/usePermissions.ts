import { useAuth } from '@/hooks/useAuth'

export type Permission = 
  | 'user.read' 
  | 'user.approve' 
  | 'user.manage'
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'category.create'
  | 'category.update'
  | 'category.delete'

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    
    const role = user.role.toLowerCase()
    
    // Super admin has all permissions
    if (role === 'super_admin' || role === 'superadmin') return true

    // Admin role mapping
    if (role === 'admin') {
       return true // Admins have all currently used permissions
    }
    
    // Fallback for other roles (e.g. customer)
    return false
  }

  return { hasPermission }
}
