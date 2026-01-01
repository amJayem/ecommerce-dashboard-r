import { api, type ApiError } from "../axios";
import axios from "axios";

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  detailedDescription?: string | null;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  stock: number;
  inStock: boolean;
  lowStockThreshold: number;
  categoryId?: number | null;
  unit: string;
  weight?: number | null;
  images: string[];
  isActive: boolean;
  tags: string[];
  featured: boolean;
  bestseller: boolean;
  status: "draft" | "published" | "archived";
  sku?: string | null;
  brand?: string | null;
  coverImage?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  };
}

export interface ProductListParams {
  categoryId?: number;
  categorySlug?: string;
  status?: "draft" | "published" | "archived";
  featured?: boolean;
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SearchProductsParams {
  q?: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "oldest";
  page?: number;
  limit?: number;
}

export interface SearchProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  shortDescription: string;
  detailedDescription: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  lowStockThreshold?: number;
  categoryId?: number;
  unit?: string;
  weight?: number;
  images?: string[];
  isActive?: boolean;
  tags?: string[];
  featured?: boolean;
  bestseller?: boolean;
  status?: "draft" | "published" | "archived";
  sku?: string;
  brand?: string;
  coverImage?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number;
}

export interface UpdateStockRequest {
  quantity: number;
}

export interface CategoryProductsResponse {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  products: Product[];
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
export const productQueries = {
  /**
   * Get all products with pagination and optional filters
   */
  getProducts: async (params?: ProductListParams): Promise<ProductsResponse> => {
    try {
      const response = await api.get<ProductsResponse>("/products", {
        params,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch products");
    }
  },

  /**
   * Get a single product by ID
   */
  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Product not found");
      }
      return handleApiError(error, "Failed to fetch product");
    }
  },

  /**
   * Get a single product by slug
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`/products/slug/${slug}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Product not found");
      }
      return handleApiError(error, "Failed to fetch product");
    }
  },

  /**
   * Get featured products
   */
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>("/products/featured");
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch featured products");
    }
  },

  /**
   * Get bestseller products
   */
  getBestsellerProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>("/products/bestsellers");
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to fetch bestseller products");
    }
  },

  /**
   * Search products with advanced filters
   */
  searchProducts: async (
    params?: SearchProductsParams
  ): Promise<SearchProductsResponse> => {
    try {
      const response = await api.get<SearchProductsResponse>(
        "/products/search",
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error, "Search failed");
    }
  },

  /**
   * Get products by category slug
   */
  getProductsByCategory: async (
    slug: string
  ): Promise<CategoryProductsResponse> => {
    try {
      const response = await api.get<CategoryProductsResponse>(
        `/products/category/${slug}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Category not found");
      }
      return handleApiError(error, "Failed to fetch category products");
    }
  },

  /**
   * Export products to CSV (Admin only)
   */
  exportProductsCsv: async (): Promise<Blob> => {
    try {
      const response = await api.get("/products/export/csv", {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to export products");
    }
  },
};

// Mutation Functions
export const productMutations = {
  /**
   * Create a new product (Admin only)
   */
  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    try {
      const response = await api.post<Product>("/products", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const apiError = error.response.data as ApiError;
        const message = Array.isArray(apiError.message)
          ? apiError.message.join(", ")
          : apiError.message || "Product with this slug already exists";
        throw new Error(message);
      }
      return handleApiError(error, "Failed to create product");
    }
  },

  /**
   * Update an existing product (Admin only)
   */
  updateProduct: async (data: UpdateProductRequest): Promise<Product> => {
    try {
      const { id, ...updateData } = data;
      const response = await api.patch<Product>(`/products/${id}`, updateData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Product not found");
      }
      return handleApiError(error, "Failed to update product");
    }
  },

  /**
   * Delete a product (Admin only)
   */
  deleteProduct: async (
    id: number
  ): Promise<{ id: number; name: string; message: string }> => {
    try {
      const response = await api.delete<{
        id: number;
        name: string;
        message: string;
      }>(`/products/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Product not found");
      }
      return handleApiError(error, "Failed to delete product");
    }
  },

  /**
   * Update product stock (Admin only)
   */
  updateStock: async (
    id: number,
    data: UpdateStockRequest
  ): Promise<{ id: number; stock: number; inStock: boolean; message: string }> => {
    try {
      const response = await api.patch<{
        id: number;
        stock: number;
        inStock: boolean;
        message: string;
      }>(`/products/${id}/stock`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error("Product not found");
      }
      return handleApiError(error, "Failed to update stock");
    }
  },

  /**
   * Import products from CSV (Admin only)
   */
  importProductsCsv: async (file: File): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post<any>(
        "/products/import/csv",
        formData,
        {
          headers: {
            "Content-Type": undefined, // Force Axios to set correctly with boundary
          },
        }
      );
      console.log("Import response:", response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, "Failed to import products");
    }
  },
};

