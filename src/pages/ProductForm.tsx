import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageTitle } from "@/hooks/use-page-title"
import { useAuth } from "@/hooks/useAuth"
import {
  productApi,
  type CreateProductRequest,
  type Product,
} from "@/lib/products"
import {
  categoryApi,
  type Category,
} from "@/lib/categories"
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  PackagePlus,
  Save,
} from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

interface ProductFormState {
  name: string
  slug: string
  shortDescription: string
  description: string
  price: string
  originalPrice: string
  stock: string
  lowStockThreshold: string
  categoryId: string
  status: "draft" | "published" | "archived"
  featured: boolean
  isActive: boolean
  unit: string
  weight: string
  coverImage: string
  images: string
  tags: string
}

const defaultFormState: ProductFormState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: "",
  lowStockThreshold: "",
  categoryId: "",
  status: "draft",
  featured: false,
  isActive: true,
  unit: "pcs",
  weight: "",
  coverImage: "",
  images: "",
  tags: "",
}

const unitOptions = ["pcs", "set", "box", "pack", "kg", "g", "lb", "liter", "ml"]

export function ProductForm() {
  const { productId } = useParams<{ productId?: string }>()
  const isEditMode = Boolean(productId)
  usePageTitle(isEditMode ? "Edit Product" : "Add Product")

  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const [formState, setFormState] = useState<ProductFormState>(defaultFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [coverImageError, setCoverImageError] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const additionalImages = useMemo(() => {
    return formState.images
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean)
  }, [formState.images])

  const categoryDropdownOptions = useMemo(() => {
    return categories
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((category) => ({
        id: category.id,
        label: category.parent?.name
          ? `${category.parent.name} › ${category.name}`
          : category.name,
      }))
  }, [categories])

  useEffect(() => {
    const loadProduct = async () => {
      if (!isEditMode || !productId) {
        setIsLoadingProduct(false)
        return
      }

      try {
        const product = await productApi.getProductById(Number(productId))
        hydrateForm(product)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load product"
        setPageError(message)
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [isEditMode, productId])

  useEffect(() => {
    setCoverImageError(false)
  }, [formState.coverImage])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const data = await categoryApi.getCategories()
        setCategories(data)
        setCategoriesError(null)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load categories"
        setCategoriesError(message)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const hydrateForm = (product: Product) => {
    setFormState({
      name: product.name ?? "",
      slug: product.slug ?? "",
      shortDescription: product.shortDescription ?? product.description ?? "",
      description:
        product.detailedDescription ?? product.description ?? product.shortDescription ?? "",
      price: product.price?.toString() ?? "",
      originalPrice: product.originalPrice?.toString() ?? "",
      stock: product.stock?.toString() ?? "",
      lowStockThreshold: product.lowStockThreshold?.toString() ?? "",
      categoryId: product.categoryId?.toString() ?? "",
      status: product.status ?? "draft",
      featured: Boolean(product.featured),
      isActive: Boolean(product.isActive),
      unit: product.unit ?? "pcs",
      weight: product.weight?.toString() ?? "",
      coverImage: product.coverImage ?? "",
      images: product.images?.join(", ") ?? "",
      tags: product.tags?.join(", ") ?? "",
    })
  }

  const handleChange = (
    field: keyof ProductFormState,
    value: string | boolean
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const buildPayload = (): CreateProductRequest => {
    const parseNumber = (val: string) =>
      val.trim() ? Number(val.trim()) : undefined

    const tags =
      formState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) ?? []

    const images =
      formState.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean) ?? []

    return {
      name: formState.name.trim(),
      slug: formState.slug.trim(),
      shortDescription: formState.shortDescription.trim(),
      description: formState.description.trim() || undefined,
      detailedDescription: formState.description.trim() || undefined,
      price: parseNumber(formState.price) ?? 0,
      originalPrice: parseNumber(formState.originalPrice),
      stock: parseNumber(formState.stock) ?? 0,
      lowStockThreshold: parseNumber(formState.lowStockThreshold),
      categoryId: parseNumber(formState.categoryId),
      unit: formState.unit.trim() || "pcs",
      weight: parseNumber(formState.weight),
      status: formState.status,
      featured: formState.featured,
      isActive: formState.isActive,
      coverImage: formState.coverImage.trim() || undefined,
      images: images.length ? images : undefined,
      tags: tags.length ? tags : undefined,
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPageError(null)
    setSuccessMessage(null)

    if (!isAdmin) {
      setPageError("You do not have permission to perform this action.")
      return
    }

    if (!formState.name.trim() || !formState.slug.trim()) {
      setPageError("Name and slug are required.")
      return
    }

    try {
      setIsSubmitting(true)
      const payload = buildPayload()

      if (isEditMode && productId) {
        await productApi.updateProduct({
          id: Number(productId),
          ...payload,
        })
        setSuccessMessage("Product updated successfully.")
      } else {
        const created = await productApi.createProduct(payload)
        setSuccessMessage("Product created successfully.")
        // Navigate to edit page for the newly created product
        navigate(`/products/${created.id}/edit`, { replace: true })
        return
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save product"
      setPageError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <Link to="/products" className="text-sm text-primary hover:underline">
            Back to products
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Only administrators can add or edit products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isEditMode && isLoadingProduct) {
    return <ProductFormSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update product details and manage inventory."
              : "Create a new product by adding the essential details."}
          </p>
        </div>
        {!isEditMode && (
          <div className="hidden sm:block">
            <PackagePlus className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            Provide the basic information about the product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pageError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{pageError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
              <Save className="h-4 w-4" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Organic Green Tea"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formState.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="organic-green-tea"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <textarea
                id="shortDescription"
                value={formState.shortDescription}
                onChange={(e) =>
                  handleChange("shortDescription", e.target.value)
                }
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="A quick summary that shows up in listings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <textarea
                id="description"
                value={formState.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Add more details, features, ingredients, etc."
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="29.99"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (optional)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.originalPrice}
                  onChange={(e) =>
                    handleChange("originalPrice", e.target.value)
                  }
                  placeholder="39.99"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formState.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  placeholder="120"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={formState.lowStockThreshold}
                  onChange={(e) =>
                    handleChange("lowStockThreshold", e.target.value)
                  }
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                {categoriesError ? (
                  <>
                    <Input
                      id="categoryId"
                      type="number"
                      min="0"
                      value={formState.categoryId}
                      onChange={(e) => handleChange("categoryId", e.target.value)}
                      placeholder="Enter category ID"
                    />
                    <p className="text-xs text-destructive">
                      {categoriesError}. Enter category ID manually.
                    </p>
                  </>
                ) : (
                  <select
                    id="categoryId"
                    value={formState.categoryId}
                    onChange={(e) => handleChange("categoryId", e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? "Loading categories..." : "Select a category"}
                    </option>
                    {categoryDropdownOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  value={formState.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {unitOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formState.status}
                  onChange={(e) =>
                    handleChange("status", e.target.value as ProductFormState["status"])
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  value={formState.coverImage}
                  onChange={(e) => handleChange("coverImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {formState.coverImage.trim() && !coverImageError && (
                  <div className="mt-3 flex items-center gap-4 rounded-lg border border-dashed border-muted p-3">
                    <div className="h-20 w-20 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={formState.coverImage.trim()}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                        onError={() => setCoverImageError(true)}
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground break-all">
                      {formState.coverImage.trim()}
                    </p>
                  </div>
                )}
                {coverImageError && formState.coverImage.trim() && (
                  <p className="mt-2 text-xs text-destructive">
                    Unable to load preview. Please verify the image URL.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Additional Images (comma separated)</Label>
                <Input
                  id="images"
                  value={formState.images}
                  onChange={(e) => handleChange("images", e.target.value)}
                  placeholder="https://img1.jpg, https://img2.jpg"
                />
                {additionalImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {additionalImages.slice(0, 6).map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="h-16 w-16 overflow-hidden rounded-md border bg-muted"
                        title={url}
                      >
                        <img
                          src={url}
                          alt={`Additional preview ${index + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formState.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                placeholder="wellness, organic, tea"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formState.featured}
                  onChange={(e) => handleChange("featured", e.target.checked)}
                  className="h-4 w-4 rounded-sm border-2 border-gray-300 bg-white text-black focus:ring-2 focus:ring-ring focus:ring-offset-2 checked:bg-black checked:border-black checked:text-white"
                />
                Featured product
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formState.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 rounded-sm border-2 border-gray-300 bg-white text-black focus:ring-2 focus:ring-ring focus:ring-offset-2 checked:bg-black checked:border-black checked:text-white"
                />
                Active and visible in store
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Update Product" : "Create Product"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductFormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-20" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

