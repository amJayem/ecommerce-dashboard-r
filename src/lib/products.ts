import axios from "axios";
import { api, type ApiError } from "./api";

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
  detailedDescription?: string;
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

// Product API functions
export const productApi = {
  /**
   * Get all products with pagination and optional filters
   */
  async getProducts(params?: ProductListParams): Promise<ProductsResponse> {
    try {
      const response = await api.get<ProductsResponse>("/products", {
        params,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to fetch products"
        );
      }
      throw new Error("Failed to fetch products");
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("Product not found");
        }
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to fetch product"
        );
      }
      throw new Error("Failed to fetch product");
    }
  },

  /**
   * Get a single product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await api.get<Product>(`/products/slug/${slug}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("Product not found");
        }
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to fetch product"
        );
      }
      throw new Error("Failed to fetch product");
    }
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>("/products/featured");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to fetch featured products"
        );
      }
      throw new Error("Failed to fetch featured products");
    }
  },

  /**
   * Get bestseller products
   */
  async getBestsellerProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>("/products/bestsellers");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to fetch bestseller products"
        );
      }
      throw new Error("Failed to fetch bestseller products");
    }
  },

  /**
   * Search products with advanced filters
   */
  async searchProducts(
    params?: SearchProductsParams
  ): Promise<SearchProductsResponse> {
    try {
      const response = await api.get<SearchProductsResponse>(
        "/products/search",
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Search failed"
        );
      }
      throw new Error("Search failed");
    }
  },

  /**
   * Get products by category slug
   */
  async getProductsByCategory(
    slug: string
  ): Promise<CategoryProductsResponse> {
    try {
      const response = await api.get<CategoryProductsResponse>(
        `/products/category/${slug}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("Category not found");
        }
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to fetch category products"
        );
      }
      throw new Error("Failed to fetch category products");
    }
  },

  /**
   * Create a new product (Admin only)
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await api.post<Product>("/products", data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const apiError = error.response.data as ApiError;
        if (error.response.status === 409) {
          throw new Error(
            Array.isArray(apiError.message)
              ? apiError.message.join(", ")
              : apiError.message || "Product with this slug already exists"
          );
        }
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to create product"
        );
      }
      throw new Error("Failed to create product");
    }
  },

  /**
   * Update an existing product (Admin only)
   */
  async updateProduct(data: UpdateProductRequest): Promise<Product> {
    try {
      const { id, ...updateData } = data;
      const response = await api.patch<Product>(`/products/${id}`, updateData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("Product not found");
        }
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to update product"
        );
      }
      throw new Error("Failed to update product");
    }
  },

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(id: number): Promise<{ id: number; name: string; message: string }> {
    try {
      const response = await api.delete<{
        id: number;
        name: string;
        message: string;
      }>(`/products/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("Product not found");
        }
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to delete product"
        );
      }
      throw new Error("Failed to delete product");
    }
  },

  /**
   * Update product stock (Admin only)
   */
  async updateStock(
    id: number,
    data: UpdateStockRequest
  ): Promise<{ id: number; stock: number; inStock: boolean; message: string }> {
    try {
      const response = await api.patch<{
        id: number;
        stock: number;
        inStock: boolean;
        message: string;
      }>(`/products/${id}/stock`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error("Product not found");
        }
        const apiError = error.response.data as ApiError;
        throw new Error(
          Array.isArray(apiError.message)
            ? apiError.message.join(", ")
            : apiError.message || "Failed to update stock"
        );
      }
      throw new Error("Failed to update stock");
    }
  },
};

