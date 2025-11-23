import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  productQueries,
  productMutations,
  type Product,
  type ProductListParams,
  type ProductsResponse,
  type CreateProductRequest,
  type UpdateProductRequest,
  type UpdateStockRequest
} from '@/lib/api/queries/products'

// Re-export types for convenience
export type {
  Product,
  ProductsResponse,
  ProductListParams,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateStockRequest
}

// Helper to serialize params for stable query keys
const serializeParams = (params?: ProductListParams): string => {
  if (!params) return 'all'
  // Sort keys and stringify to ensure stable serialization
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      const value = params[key as keyof ProductListParams]
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, unknown>)
  return JSON.stringify(sorted)
}

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params?: ProductListParams) =>
    [...productKeys.lists(), serializeParams(params)] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  bySlug: (slug: string) => [...productKeys.details(), 'slug', slug] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  bestsellers: () => [...productKeys.all, 'bestsellers'] as const,
  byCategory: (slug: string) => [...productKeys.all, 'category', slug] as const
}

// Hooks
export function useProducts(params?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productQueries.getProducts(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnReconnect: false
  })
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id!),
    queryFn: () => productQueries.getProductById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.bySlug(slug!),
    queryFn: () => productQueries.getProductBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => productQueries.getFeaturedProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useBestsellerProducts() {
  return useQuery({
    queryKey: productKeys.bestsellers(),
    queryFn: () => productQueries.getBestsellerProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useProductsByCategory(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.byCategory(slug!),
    queryFn: () => productQueries.getProductsByCategory(slug!),
    enabled: !!slug,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

// Mutations
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      productMutations.createProduct(data),
    onSuccess: () => {
      // Invalidate product lists to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    }
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProductRequest) =>
      productMutations.updateProduct(data),
    onSuccess: (data) => {
      // Invalidate specific product and lists
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    }
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productMutations.deleteProduct(id),
    onSuccess: () => {
      // Invalidate product lists to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    }
  })
}

export function useUpdateProductStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockRequest }) =>
      productMutations.updateStock(id, data),
    onSuccess: (data) => {
      // Invalidate specific product
      queryClient.invalidateQueries({ queryKey: productKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    }
  })
}
