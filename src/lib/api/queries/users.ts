import { api } from '@/lib/api'
import type { User } from '@/lib/api/queries/auth'

export interface Permission {
  id: number
  name: string
  description: string
  category: string
  action: string
  subject: string
}

export interface Role {
  id: number
  name: string
  description: string
}

export interface UserManagementResponse {
  users: User[]
  total: number
}

export const userMutations = {
  approveUser: async ({ id, role, permissions }: { id: number, role: string, permissions: string[] }) => {
    const response = await api.patch<{ user: User }>(`/users/${id}/approve`, {
      role,
      permissions
    })
    return response.data.user
  },
  rejectUser: async (id: number) => {
    const response = await api.patch<{ user: User }>(`/users/${id}/reject`)
    return response.data.user
  },
  suspendUser: async (id: number) => {
    const response = await api.patch<{ user: User }>(`/users/${id}/suspend`)
    return response.data.user
  },
}

export const userQueries = {
  getUsers: async (status?: string) => {
    const params = status && status !== 'ALL' ? { status } : {}
    const response = await api.get<User[]>('/users', { params })
    return response.data
  },
  getPermissions: async () => {
    const response = await api.get<Permission[]>('/permissions')
    return response.data
  },
}
