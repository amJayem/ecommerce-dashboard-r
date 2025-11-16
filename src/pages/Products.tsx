import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, type Column } from "@/components/ui/data-table"
import { Package, Plus, Search, Edit, Trash2, X, Filter } from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"
import { useDebounce } from "@/hooks/use-debounce"
import { formatCurrency } from "@/lib/constants"
import { productApi, type Product, type ProductListParams } from "@/lib/products"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

type StatusFilter = "all" | "draft" | "published" | "archived"
type FeaturedFilter = "all" | "yes" | "no"
type StockFilter = "all" | "yes" | "no"

export function Products() {
  usePageTitle("Products")
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500) // Debounce search input by 500ms
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(20) // Items per page
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  // Filter states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [categoryId, setCategoryId] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  const isAdmin = user?.role === "admin"

  // Define table columns
  const columns: Column<Product>[] = [
    {
      key: "product",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.coverImage ? (
            <img
              src={product.coverImage}
              alt={product.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Package className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.slug}</p>
            {product.sku && (
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (product) => product.category?.name || "Uncategorized",
    },
    {
      key: "price",
      label: "Price",
      render: (product) => (
        <div className="font-medium">
          {formatCurrency(product.price)}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="ml-2 text-sm text-muted-foreground line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      render: (product) => (
        <span
          className={cn(
            product.stock <= product.lowStockThreshold && product.stock > 0
              ? "text-yellow-600 dark:text-yellow-400"
              : product.stock === 0
              ? "text-red-600 dark:text-red-400"
              : ""
          )}
        >
          {product.stock}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (product) => (
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-1 text-xs font-medium w-fit",
              product.inStock
                ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            )}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-1 text-xs font-medium w-fit",
              product.status === "published"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : product.status === "draft"
                ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
            )}
          >
            {product.status}
          </span>
          {product.featured && (
            <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium w-fit bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
              Featured
            </span>
          )}
        </div>
      ),
    },
    {
      key: "dates",
      label: "Dates",
      render: (product) => (
        <div className="flex flex-col gap-1 text-sm">
          <div>
            <span className="text-muted-foreground">Created: </span>
            <span className="text-foreground">
              {new Date(product.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Updated: </span>
            <span className="text-foreground">
              {new Date(product.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      ),
    },
  ]

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params: ProductListParams = {
          page: currentPage,
          limit: limit,
        }

        // Apply filters
        if (statusFilter !== "all") {
          params.status = statusFilter
        }

        if (featuredFilter !== "all") {
          params.featured = featuredFilter === "yes"
        }

        if (stockFilter !== "all") {
          params.inStock = stockFilter === "yes"
        }

        if (categoryId.trim()) {
          const categoryIdNum = parseInt(categoryId.trim())
          if (!isNaN(categoryIdNum)) {
            params.categoryId = categoryIdNum
          }
        }

        if (debouncedSearchQuery.trim()) {
          params.search = debouncedSearchQuery.trim()
        }

        const response = await productApi.getProducts(params)
        setProducts(response.products)
        setPagination(response.pagination)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch products"
        setError(errorMessage)
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, debouncedSearchQuery, statusFilter, featuredFilter, stockFilter, categoryId, limit])

  // Reset to page 1 when limit changes
  // useEffect(() => {
  //   if (currentPage !== 1) {
  //     setCurrentPage(1)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [limit])

  // Reset to page 1 when debounced search query changes (but not when clearing search)
  useEffect(() => {
    if (debouncedSearchQuery.trim() && currentPage !== 1) {
      setCurrentPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery])

  const clearFilters = () => {
    setStatusFilter("all")
    setFeaturedFilter("all")
    setStockFilter("all")
    setCategoryId("")
    setSearchQuery("")
    setCurrentPage(1)
  }

  const hasActiveFilters = 
    statusFilter !== "all" ||
    featuredFilter !== "all" ||
    stockFilter !== "all" ||
    categoryId.trim() !== "" ||
    searchQuery.trim() !== ""

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      await productApi.deleteProduct(id)
      // Refresh products list with current filters
      const params: ProductListParams = {
        page: currentPage,
        limit: limit,
      }
      if (statusFilter !== "all") params.status = statusFilter
      if (featuredFilter !== "all") params.featured = featuredFilter === "yes"
      if (stockFilter !== "all") params.inStock = stockFilter === "yes"
      if (categoryId.trim()) {
        const categoryIdNum = parseInt(categoryId.trim())
        if (!isNaN(categoryIdNum)) params.categoryId = categoryIdNum
      }
      if (debouncedSearchQuery.trim()) params.search = debouncedSearchQuery.trim()

      const response = await productApi.getProducts(params)
      setProducts(response.products)
      setPagination(response.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product"
      alert(errorMessage)
      console.error("Error deleting product:", err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and details.
          </p>
        </div>
        {isAdmin && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Search & Filter Products</CardTitle>
              <CardDescription>Find products by name, category, SKU, or apply filters</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name, description, or tags..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  // Reset to page 1 when user starts typing
                  if (currentPage !== 1) {
                    setCurrentPage(1)
                  }
                }}
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter)
                    setCurrentPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Featured Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Featured</label>
                <select
                  value={featuredFilter}
                  onChange={(e) => {
                    setFeaturedFilter(e.target.value as FeaturedFilter)
                    setCurrentPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Products</option>
                  <option value="yes">Featured Only</option>
                  <option value="no">Not Featured</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Status</label>
                <select
                  value={stockFilter}
                  onChange={(e) => {
                    setStockFilter(e.target.value as StockFilter)
                    setCurrentPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All Products</option>
                  <option value="yes">In Stock</option>
                  <option value="no">Out of Stock</option>
                </select>
              </div>

              {/* Category ID Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category ID</label>
                <Input
                  type="number"
                  placeholder="Enter category ID"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value)
                    setCurrentPage(1)
                  }}
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {featuredFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Featured: {featuredFilter === "yes" ? "Yes" : "No"}
                  <button
                    onClick={() => setFeaturedFilter("all")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {stockFilter !== "all" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Stock: {stockFilter === "yes" ? "In Stock" : "Out of Stock"}
                  <button
                    onClick={() => setStockFilter("all")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categoryId.trim() && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Category ID: {categoryId}
                  <button
                    onClick={() => setCategoryId("")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {debouncedSearchQuery.trim() && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                  Search: {debouncedSearchQuery}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            A list of all products in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            error={error}
            emptyMessage="No products found"
            actions={
              isAdmin
                ? (product) => (
                    <>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )
                : undefined
            }
            actionsHeader="Actions"
            keyExtractor={(product) => product.id}
          />

          {/* Pagination */}
          {!loading && !error && products.length > 0 && (
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {products.length} of {pagination.total} products
                  </p>
                  <div className="flex items-center gap-2">
                    <label htmlFor="limit-select" className="text-sm text-muted-foreground">
                      Items per page:
                    </label>
                    <select
                      id="limit-select"
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value))
                        setCurrentPage(1) // Reset to page 1 when limit changes
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                {pagination.pages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Retry Button */}
          {error && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setError(null)
                  setCurrentPage(1)
                }}
              >
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

