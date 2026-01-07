import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  categoryQueries,
  categoryMutations,
  type Category,
  type CategoryListParams,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type CategoryProduct
} from '@/lib/api/queries/categories'

// Re-export types for convenience
export type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryProduct
}

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  hierarchy: () => [...categoryKeys.all, 'hierarchy'] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
  bySlug: (slug: string) => [...categoryKeys.details(), 'slug', slug] as const,
  products: (id: number) => [...categoryKeys.detail(id), 'products'] as const
}

// Hooks
export function useCategories(params?: CategoryListParams) {
  return useQuery({
    queryKey: params ? [...categoryKeys.list(), params] : categoryKeys.list(),
    queryFn: () => categoryQueries.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useCategoryHierarchy() {
  return useQuery({
    queryKey: categoryKeys.hierarchy(),
    queryFn: () => categoryQueries.getHierarchy(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useCategory(id: number | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id!),
    queryFn: () => categoryQueries.getCategoryById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useCategoryBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.bySlug(slug!),
    queryFn: () => categoryQueries.getCategoryBySlug(slug!),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

export function useCategoryProducts(id: number | undefined) {
  return useQuery({
    queryKey: categoryKeys.products(id!),
    queryFn: () => categoryQueries.getCategoryProducts(id!),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })
}

// Mutations
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryMutations.createCategory(data),
    onSuccess: () => {
      // Invalidate category lists to refetch
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.hierarchy() })
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) =>
      categoryMutations.updateCategory(data),
    onSuccess: (data) => {
      // Invalidate specific category and lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: categoryKeys.hierarchy() })
      queryClient.invalidateQueries({
        queryKey: categoryKeys.products(data.id)
      })
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryMutations.deleteCategory(id),
    onSuccess: () => {
      // Invalidate category lists to refetch
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.hierarchy() });
    },
  });
}

export function useImportCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => categoryMutations.importCategoriesCsv(file),
    onSuccess: () => {
      // Invalidate category lists to refetch
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.hierarchy() });
    },
  });
}
