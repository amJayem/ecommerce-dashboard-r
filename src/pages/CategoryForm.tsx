import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate, useParams, Link } from "react-router-dom"
import { z } from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, type Column } from "@/components/ui/data-table"
import { usePageTitle } from "@/hooks/use-page-title"
import { useAuth } from "@/hooks/useAuth"
import {
  categoryApi,
  type Category,
  type CreateCategoryRequest,
  type CategoryProduct,
} from "@/lib/categories"
import { formatCurrency } from "@/lib/constants"
import { AlertCircle, ArrowLeft, Loader2, Save, Package, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(255, "Name is too long"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required").max(2000, "Description is too long"),
  icon: z.string().max(4, "Icon must be 4 characters or less").optional(),
  image: z.string().url("Image must be a valid URL").optional().or(z.literal("")),
  parentId: z.coerce.number().int("Parent ID must be a whole number").positive("Invalid parent category").optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int("Sort order must be a whole number").min(0, "Sort order cannot be negative").default(0),
  metaTitle: z.string().max(255, "Meta title is too long").optional(),
  metaDescription: z.string().max(500, "Meta description is too long").optional(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

export function CategoryForm() {
  const { categoryId } = useParams<{ categoryId?: string }>()
  const isEditMode = Boolean(categoryId)
  usePageTitle(isEditMode ? "Edit Category" : "Add Category")

  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoadingCategory, setIsLoadingCategory] = useState(isEditMode)
  const [coverImageError, setCoverImageError] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const [products, setProducts] = useState<CategoryProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  const form = useForm<CategoryFormValues>({
    // @ts-expect-error - zodResolver with z.coerce causes type inference issues, but works at runtime
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: "",
      image: "",
      parentId: null,
      isActive: true,
      sortOrder: 0,
      metaTitle: "",
      metaDescription: "",
    },
  })

  useEffect(() => {
    const loadCategory = async () => {
      if (!isEditMode || !categoryId) {
        setIsLoadingCategory(false)
        return
      }

      try {
        const category = await categoryApi.getCategoryById(Number(categoryId))
        form.reset({
          name: category.name ?? "",
          slug: category.slug ?? "",
          description: category.description ?? "",
          icon: category.icon ?? "",
          image: category.image ?? "",
          parentId: category.parentId ?? null,
          isActive: category.isActive,
          sortOrder: category.sortOrder ?? 0,
          metaTitle: category.metaTitle ?? "",
          metaDescription: category.metaDescription ?? "",
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load category"
        setPageError(message)
      } finally {
        setIsLoadingCategory(false)
      }
    }

    loadCategory()
  }, [isEditMode, categoryId, form])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const data = await categoryApi.getCategories()
        setCategories(data)
        setCategoriesError(null)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch categories"
        setCategoriesError(message)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const coverImageValue = form.watch("image")
  useEffect(() => {
    setCoverImageError(false)
  }, [coverImageValue])

  // Fetch products for this category when in edit mode
  useEffect(() => {
    const fetchProducts = async () => {
      if (!isEditMode || !categoryId) {
        return
      }

      try {
        setProductsLoading(true)
        setProductsError(null)
        const categoryProducts = await categoryApi.getCategoryProducts(Number(categoryId))
        setProducts(categoryProducts)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch products"
        setProductsError(message)
        console.error("Error fetching category products:", error)
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [isEditMode, categoryId])

  const availableParentOptions = useMemo(() => {
    return categories
      .filter((category) => category.id !== Number(categoryId))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [categories, categoryId])

  // Define columns for products table
  const productColumns: Column<CategoryProduct>[] = useMemo(
    () => [
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
              <Link
                to={`/products/${product.id}/edit`}
                className="font-medium hover:underline flex items-center gap-1"
              >
                {product.name}
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </Link>
              <p className="text-sm text-muted-foreground">{product.slug}</p>
            </div>
          </div>
        ),
      },
      {
        key: "price",
        label: "Price",
        render: (product) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
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
              "font-medium",
              product.stock === 0
                ? "text-destructive"
                : product.stock < 10
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-foreground"
            )}
          >
            {product.stock}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (product) => {
          const status = product.status || "draft"
          return (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-1 text-xs font-medium w-fit",
                status === "published"
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                  : status === "draft"
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )
        },
      },
      {
        key: "badges",
        label: "Badges",
        render: (product) => (
          <div className="flex flex-wrap gap-1">
            {product.featured && (
              <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Featured
              </span>
            )}
            {product.bestseller && (
              <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Bestseller
              </span>
            )}
          </div>
        ),
      },
    ],
    []
  )

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    if (!isAdmin) {
      setPageError("You do not have permission to perform this action.")
      return
    }

    setPageError(null)
    setSuccessMessage(null)

    try {
      setIsSubmitting(true)

      const parseNumber = (val: number | null | undefined) =>
        val !== null && val !== undefined ? Number(val) : undefined

      const payload: CreateCategoryRequest = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        description: data.description.trim(),
        icon: data.icon?.trim() || undefined,
        image: data.image?.trim() || undefined,
        parentId: parseNumber(data.parentId),
        isActive: data.isActive,
        sortOrder: parseNumber(data.sortOrder),
        metaTitle: data.metaTitle?.trim() || undefined,
        metaDescription: data.metaDescription?.trim() || undefined,
      }

      if (isEditMode && categoryId) {
        await categoryApi.updateCategory({
          id: Number(categoryId),
          ...payload,
        })
        setSuccessMessage("Category updated successfully.")
      } else {
        const created = await categoryApi.createCategory(payload)
        setSuccessMessage("Category created successfully.")
        navigate(`/categories/${created.id}/edit`, { replace: true })
        return
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save category"
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
          <Link to="/categories" className="text-sm text-primary hover:underline">
            Back to categories
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Only administrators can add or edit categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please contact an administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )}
  
  if (isEditMode && isLoadingCategory) {
    return <CategoryFormSkeleton />
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="pl-0 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Category" : "Add Category"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? "Update the category details."
              : "Create a new category to organize products."}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Provide the information used to organize and display products.
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

          {/* @ts-expect-error - Form component type inference issue with react-hook-form, but works at runtime */}
          <Form {...form}>
            {/* @ts-expect-error - Type inference issue with z.coerce, but works at runtime */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          placeholder="Beverages"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="slug">Slug</FormLabel>
                      <FormControl>
                        <Input
                          id="slug"
                          placeholder="beverages"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Describe this category"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="icon">Icon / Emoji</FormLabel>
                      <FormControl>
                        <Input
                          id="icon"
                          placeholder="🍹"
                          maxLength={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="sortOrder">Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          id="sortOrder"
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? 0 : e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="image">Image URL</FormLabel>
                      <FormControl>
                        <Input
                          id="image"
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      {coverImageValue && !coverImageError && (
                        <div className="mt-3 flex items-center gap-4 rounded-lg border border-dashed border-muted p-3">
                          <div className="h-20 w-20 overflow-hidden rounded-md border bg-muted">
                            <img
                              src={coverImageValue}
                              alt="Category preview"
                              className="h-full w-full object-cover"
                              onError={() => setCoverImageError(true)}
                              loading="lazy"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground break-all">
                            {coverImageValue}
                          </p>
                        </div>
                      )}
                      {coverImageError && coverImageValue && (
                        <FormDescription className="text-destructive">
                          Unable to load preview. Please verify the image URL.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="parentId">Parent Category</FormLabel>
                      <FormControl>
                        {categoriesError ? (
                          <Input
                            id="parentId"
                            type="number"
                            min="0"
                            placeholder="Enter parent category ID"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                          />
                        ) : (
                          <Select
                            id="parentId"
                            disabled={categoriesLoading}
                            {...field}
                            value={field.value?.toString() ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                          >
                            <option value="">
                              {categoriesLoading ? "Loading categories..." : "No parent (top level)"}
                            </option>
                            {availableParentOptions.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.parent?.name
                                  ? `${category.parent.name} › ${category.name}`
                                  : category.name}
                              </option>
                            ))}
                          </Select>
                        )}
                      </FormControl>
                      {categoriesError && (
                        <FormDescription className="text-destructive">
                          {categoriesError}. Enter parent ID manually if needed.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="metaTitle">Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          id="metaTitle"
                          placeholder="SEO friendly title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="metaDescription">Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          id="metaDescription"
                          placeholder="Short SEO description"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded-sm border-2 border-gray-300 bg-white text-black focus:ring-2 focus:ring-ring focus:ring-offset-2 checked:bg-black checked:border-black checked:text-white"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active category</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

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
                      {isEditMode ? "Update Category" : "Create Category"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/categories")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Products List - Only show in edit mode */}
      {isEditMode && categoryId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products in this Category</CardTitle>
                <CardDescription>
                  {products.length > 0
                    ? `${products.length} product${products.length === 1 ? "" : "s"} found in this category`
                    : "No products found in this category"}
                </CardDescription>
              </div>
              {products.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/products?categoryId=${categoryId}`)}
                >
                  View All Products
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={productColumns}
              data={products}
              loading={productsLoading}
              error={productsError}
              emptyMessage="No products found in this category"
              keyExtractor={(product) => product.id}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CategoryFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button - static, no skeleton */}
      <Button
        variant="ghost"
        size="sm"
        className="pl-0 text-muted-foreground hover:text-foreground"
        disabled
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Page header - static, no skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">
            Update the category details.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            Provide the information used to organize and display products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Name and Slug - skeleton only in input fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative h-10 rounded-md border border-input bg-background">
                  <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="relative h-10 rounded-md border border-input bg-background">
                  <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-20" />
                </div>
              </div>
            </div>

            {/* Description - skeleton only in textarea */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative min-h-[120px] rounded-md border border-input bg-background p-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>

            {/* Icon and Sort Order - skeleton only in input fields */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon / Emoji</Label>
                <div className="relative h-10 rounded-md border border-input bg-background">
                  <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <div className="relative h-10 rounded-md border border-input bg-background">
                  <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-8" />
                </div>
              </div>
            </div>

            {/* Image and Parent Category */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <div className="relative h-10 rounded-md border border-input bg-background">
                  <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-32" />
                </div>
                {/* Image preview skeleton */}
                <div className="mt-3 flex items-center gap-4 rounded-lg border border-dashed border-muted p-3">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category</Label>
                <div className="relative h-9 rounded-md border border-input bg-background">
                  <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-28" />
                </div>
              </div>
            </div>

            {/* Meta Title and Meta Description */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <div className="relative h-10 rounded-md border border-input bg-background">
                  <Skeleton className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-36" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <div className="relative min-h-[80px] rounded-md border border-input bg-background p-3">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active checkbox - static, no skeleton */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 rounded-sm border-2 border-gray-300 bg-white text-black opacity-50"
                />
                Active category
              </label>
            </div>

            {/* Buttons - static, no skeleton */}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled>
                <Save className="mr-2 h-4 w-4" />
                Update Category
              </Button>
              <Button type="button" variant="outline" disabled>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}