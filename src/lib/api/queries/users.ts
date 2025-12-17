import { api } from '@/lib/api'
import type { User } from '@/lib/api/queries/auth'

export interface UserManagementResponse {
  users: User[]
  total: number
}

export const userMutations = {
  approveUser: async (id: number) => {
    const response = await api.patch<{ user: User }>(`/admin/users/${id}/approve`)
    return response.data.user
  },
  rejectUser: async (id: number) => {
    const response = await api.patch<{ user: User }>(`/admin/users/${id}/reject`)
    return response.data.user
  },
  suspendUser: async (id: number) => {
    const response = await api.patch<{ user: User }>(`/admin/users/${id}/suspend`)
    return response.data.user
  },
}

export const userQueries = {
  getUsers: async (status?: string) => {
    const params = status && status !== 'ALL' ? { status } : {}
    const response = await api.get<User[]>('/admin/users', { params })
    return response.data
  },
}
