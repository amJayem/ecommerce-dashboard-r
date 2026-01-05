import { api, type ApiError } from "../axios";
import axios from "axios";

export interface CategoryCount {
  products: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  parentId?: number | null;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
  _count?: CategoryCount;
}

export interface CategoryProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  coverImage?: string;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "published" | "archived";
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description: string;
  icon?: string;
  image?: string;
  parentId?: number | null;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number;
}

// Helper function to handle API errors
const handleApiError = (error: unknown, fallbackMessage: string): never => {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError;
    const message = Array.isArray(apiError.message)
      ? apiError.message.join(", ")
      : apiError.message || fallbackMessage;
    throw new Error(message);
  }
  throw new Error(fallbackMessage);
};

// Query Functions
export const categoryQueries = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch categories");
    }
  },

  /**
   * Get category hierarchy
   */
  getHierarchy: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>("/categories/hierarchy");
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch category hierarchy");
    }
  },

  /**
   * Get a single category by ID
   */
  getCategoryById: async (id: number): Promise<Category> => {
    try {
      const response = await api.get<Category>(`/categories/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch category");
    }
  },

  /**
   * Get a single category by slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    try {
      const response = await api.get<Category>(`/categories/slug/${slug}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch category by slug");
    }
  },

  /**
   * Get products for a specific category
   */
  getCategoryProducts: async (id: number): Promise<CategoryProduct[]> => {
    try {
      const response = await api.get<CategoryProduct[]>(
        `/categories/${id}/products`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch category products");
    }
  },

  /**
   * Export categories to CSV (Admin only)
   */
  exportCategoriesCsv: async (): Promise<Blob> => {
    try {
      const response = await api.get("/categories/export/csv", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to export categories");
    }
  },
};

// Mutation Functions
export const categoryMutations = {
  /**
   * Create a new category
   */
  createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
    try {
      const response = await api.post<Category>("/categories", data);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to create category");
    }
  },

  /**
   * Update an existing category
   */
  updateCategory: async (data: UpdateCategoryRequest): Promise<Category> => {
    const { id, ...payload } = data;
    try {
      const response = await api.patch<Category>(`/categories/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to update category");
    }
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(
        `/categories/${id}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to delete category");
    }
  },

  /**
   * Import categories from CSV (Admin only)
   */
  importCategoriesCsv: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<any>("/categories/import/csv", formData, {
        headers: {
          "Content-Type": undefined, // Force Axios to set correctly with boundary
        },
      });
      console.log("Category import response:", response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to import categories");
    }
  },
};

