import axios from "axios"
import { api, type ApiError } from "./api"

export interface CategoryCount {
  products: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  icon?: string
  image?: string
  parentId?: number | null
  isActive: boolean
  sortOrder: number
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
  parent?: Category | null
  children?: Category[]
  _count?: CategoryCount
}

export interface CategoryProduct {
  id: number
  name: string
  slug: string
  description?: string
  price: number
  originalPrice?: number
  discount?: number
  coverImage?: string
  stock: number
  featured: boolean
  bestseller: boolean
  createdAt: string
  updatedAt: string
  status: "draft" | "published" | "archived"
}

export interface CreateCategoryRequest {
  name: string
  slug: string
  description: string
  icon?: string
  image?: string
  parentId?: number | null
  isActive?: boolean
  sortOrder?: number
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number
}

const handleApiError = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError
    throw new Error(
      Array.isArray(apiError.message)
        ? apiError.message.join(", ")
        : apiError.message || fallbackMessage
    )
  }
  throw new Error(fallbackMessage)
}

export const categoryApi = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>("/categories")
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to fetch categories")
    }
  },

  async getHierarchy(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>("/categories/hierarchy")
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to fetch category hierarchy")
    }
  },

  async getCategoryById(id: number): Promise<Category> {
    try {
      const response = await api.get<Category>(`/categories/${id}`)
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to fetch category")
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    try {
      const response = await api.get<Category>(`/categories/slug/${slug}`)
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to fetch category by slug")
    }
  },

  async getCategoryProducts(id: number): Promise<CategoryProduct[]> {
    try {
      const response = await api.get<CategoryProduct[]>(
        `/categories/${id}/products`
      )
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to fetch category products")
    }
  },

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await api.post<Category>("/categories", data)
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to create category")
    }
  },

  async updateCategory(data: UpdateCategoryRequest): Promise<Category> {
    const { id, ...payload } = data
    try {
      const response = await api.patch<Category>(`/categories/${id}`, payload)
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to update category")
    }
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(
        `/categories/${id}`
      )
      return response.data
    } catch (error) {
      return handleApiError(error, "Failed to delete category")
    }
  },
}

