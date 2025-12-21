import { useAuth } from '@/hooks/useAuth'

export type Permission = 
  | 'user.read' 
  | 'user.approve' 
  | 'user.manage'
  | 'product.read'
  | 'product.create'
  | 'product.update'
  | 'product.delete'
  | 'category.read'
  | 'category.create'
  | 'category.update'
  | 'category.delete'
  | 'order.read'
  | 'order.create'
  | 'order.update'
  | 'order.delete'
  | 'admin.action'

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    
    const role = user.role.toLowerCase()
    
    // Super admin has all permissions
    if (role === 'super_admin' || role === 'superadmin') return true

    // Check 1: Explicit permissionNames array
    if (user.permissionNames && Array.isArray(user.permissionNames)) {
      if (user.permissionNames.includes(permission)) return true
    }

    // Check 2: The generic permissions array (can be strings or objects)
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.some(p => {
        // If it's a string (e.g., direct from login response)
        if (typeof p === 'string') return p === permission
        // If it's an object (e.g., from user management)
        if (typeof p === 'object' && p !== null) return p.name === permission
        return false
      })
    }

    // Fallback/Legacy: Admin role gets all permissions if no explicit ones are found
    if (role === 'admin') {
       return true
    }
    
    return false
  }

  return { hasPermission }
}
