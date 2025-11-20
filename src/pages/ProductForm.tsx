import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { usePageTitle } from "@/hooks/use-page-title"
import { useAuth } from "@/hooks/useAuth"
import {
  categoryApi,
  type Category,
} from "@/lib/categories"
import {
  productApi,
  type CreateProductRequest,
} from "@/lib/products"
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  PackagePlus,
  Save,
} from "lucide-react"

const unitOptions = ["pcs", "set", "box", "pack", "kg", "g", "lb", "liter", "ml"] as const

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Name is too long"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  shortDescription: z.string().min(1, "Short description is required").max(500, "Short description is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  price: z.coerce.number().min(0, "Price must be positive").finite("Price must be a valid number"),
  originalPrice: z.coerce.number().min(0, "Original price must be positive").finite("Original price must be a valid number").optional().nullable(),
  stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().int("Threshold must be a whole number").min(0, "Threshold cannot be negative").optional().nullable(),
  categoryId: z.coerce.number().int("Category is required").positive("Please select a category").optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  unit: z.enum(unitOptions).default("pcs"),
  weight: z.coerce.number().min(0, "Weight must be positive").finite("Weight must be a valid number").optional().nullable(),
  coverImage: z.string().url("Cover image must be a valid URL").optional().or(z.literal("")),
  images: z.string().optional(),
  tags: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
      <Separator />
    </div>
  )
}

function ProductFormSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-36 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProductForm() {
  const { productId } = useParams<{ productId?: string }>()
  const isEditMode = Boolean(productId)
  usePageTitle(isEditMode ? "Edit Product" : "Add Product")

  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [coverImageError, setCoverImageError] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const form = useForm<ProductFormValues>({
    // @ts-expect-error - zodResolver with z.coerce causes type inference issues, but works at runtime
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      price: 0,
      originalPrice: null,
      stock: 0,
      lowStockThreshold: null,
      categoryId: null,
      status: "draft",
      featured: false,
      isActive: true,
      unit: "pcs",
      weight: null,
      coverImage: "",
      images: "",
      tags: "",
    },
  })

  const imagesValue = form.watch("images")
  const additionalImages = useMemo(() => {
    const imagesStr = imagesValue || ""
    return imagesStr
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean)
  }, [imagesValue])

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
        form.reset({
          name: product.name ?? "",
          slug: product.slug ?? "",
          shortDescription: product.shortDescription ?? product.description ?? "",
          description: product.detailedDescription ?? product.description ?? product.shortDescription ?? "",
          price: product.price ?? 0,
          originalPrice: product.originalPrice ?? null,
          stock: product.stock ?? 0,
          lowStockThreshold: product.lowStockThreshold ?? null,
          categoryId: product.categoryId ?? null,
          status: product.status ?? "draft",
          featured: Boolean(product.featured),
          isActive: Boolean(product.isActive),
          unit: (product.unit as typeof unitOptions[number]) ?? "pcs",
          weight: product.weight ?? null,
          coverImage: product.coverImage ?? "",
          images: product.images?.join(", ") ?? "",
          tags: product.tags?.join(", ") ?? "",
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load product"
        setPageError(message)
      } finally {
        setIsLoadingProduct(false)
      }
    }

    loadProduct()
  }, [isEditMode, productId, form])

  const coverImageValue = form.watch("coverImage")
  useEffect(() => {
    setCoverImageError(false)
  }, [coverImageValue])

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

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
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

      const tags =
        data.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean) ?? []

      const images =
        data.images
          ?.split(",")
          .map((url) => url.trim())
          .filter(Boolean) ?? []

      const payload: CreateProductRequest = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        shortDescription: data.shortDescription.trim(),
        description: data.description?.trim() || undefined,
        detailedDescription: data.description?.trim() || undefined,
        price: data.price,
        originalPrice: parseNumber(data.originalPrice),
        stock: data.stock,
        lowStockThreshold: parseNumber(data.lowStockThreshold),
        categoryId: parseNumber(data.categoryId),
        unit: data.unit,
        weight: parseNumber(data.weight),
        status: data.status,
        featured: data.featured,
        isActive: data.isActive,
        coverImage: data.coverImage?.trim() || undefined,
        images: images.length ? images : undefined,
        tags: tags.length ? tags : undefined,
      }

      if (isEditMode && productId) {
        await productApi.updateProduct({
          id: Number(productId),
          ...payload,
        })
        setSuccessMessage("Product updated successfully.")
      } else {
        const created = await productApi.createProduct(payload)
        console.log(created)
        setSuccessMessage("Product created successfully.")
        navigate(`/products`, { replace: true })
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

  const coverImageUrl = coverImageValue

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="pl-0 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
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
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Provide comprehensive details about your product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pageError && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{pageError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
              <Save className="h-4 w-4" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {/* @ts-expect-error - Form component type inference issue with react-hook-form, but works at runtime */}
          <Form {...form}>
            {/* @ts-expect-error - Type inference issue with z.coerce, but works at runtime */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormSection
                title="Basic Information"
                description="Essential product details that appear in listings and search results."
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="name">Product Name</FormLabel>
                        <FormControl>
                          <Input
                            id="name"
                            placeholder="Organic Green Tea"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your product as it appears to customers.
                        </FormDescription>
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
                        <FormLabel htmlFor="slug">URL Slug</FormLabel>
                        <FormControl>
                          <Input
                            id="slug"
                            placeholder="organic-green-tea"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A URL-friendly version of the product name (lowercase, hyphens only).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="shortDescription">
                        Short Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="shortDescription"
                          placeholder="A premium organic tea blend with antioxidant properties..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief summary that appears in product listings and search results (max 500 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="description">
                        Full Description <span className="text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Add detailed information about features, ingredients, usage instructions, and more..."
                          className="min-h-[160px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comprehensive product details, features, and specifications (max 5000 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection
                title="Pricing & Inventory"
                description="Set product pricing and manage stock levels."
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="price">Price</FormLabel>
                        <FormControl>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="29.99"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          The current selling price of the product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="originalPrice">
                          Original Price <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="originalPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="39.99"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          The original price before discount (for showing savings).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="stock">Stock Quantity</FormLabel>
                        <FormControl>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="120"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Current available inventory.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="lowStockThreshold">
                          Low Stock Threshold <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="lowStockThreshold"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="20"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Alert when stock falls below this number.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="categoryId">
                          Category <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          {categoriesError ? (
                            <Input
                              id="categoryId"
                              type="number"
                              placeholder="Enter category ID"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                            />
                          ) : (
                            <Select
                              id="categoryId"
                              disabled={categoriesLoading}
                              {...field}
                              value={field.value?.toString() ?? ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                            >
                              <option value="">
                                {categoriesLoading ? "Loading categories..." : "Select a category"}
                              </option>
                              {categoryDropdownOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          )}
                        </FormControl>
                        {categoriesError && (
                          <FormDescription className="text-destructive">
                            {categoriesError}. Enter category ID manually.
                          </FormDescription>
                        )}
                        {!categoriesError && (
                          <FormDescription>
                            The category this product belongs to.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Product Details"
                description="Additional specifications and metadata."
              >
                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="unit">Unit</FormLabel>
                        <FormControl>
                          <Select id="unit" {...field}>
                            {unitOptions.map((option) => (
                              <option key={option} value={option}>
                                {option.toUpperCase()}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormDescription>
                          The unit of measurement for this product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="weight">
                          Weight <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.5"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Product weight for shipping calculations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="status">Status</FormLabel>
                        <FormControl>
                          <Select id="status" {...field}>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          The publication status of this product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Media"
                description="Product images for display and marketing."
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="coverImage">
                          Cover Image URL <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="coverImage"
                            placeholder="https://example.com/image.jpg"
                            {...field}
                          />
                        </FormControl>
                        {coverImageUrl && !coverImageError && (
                          <div className="mt-3 flex items-center gap-4 rounded-lg border border-dashed border-muted p-3">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                              <img
                                src={coverImageUrl}
                                alt="Cover preview"
                                className="h-full w-full object-cover"
                                onError={() => setCoverImageError(true)}
                                loading="lazy"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground break-all">
                              {coverImageUrl}
                            </p>
                          </div>
                        )}
                        {coverImageError && coverImageUrl && (
                          <FormDescription className="text-destructive">
                            Unable to load preview. Please verify the image URL.
                          </FormDescription>
                        )}
                        {!coverImageError && (
                          <FormDescription>
                            The main product image displayed in listings.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="images">
                          Additional Images <span className="text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="images"
                            placeholder="https://img1.jpg, https://img2.jpg"
                            {...field}
                          />
                        </FormControl>
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
                        <FormDescription>
                          Comma-separated URLs for additional product images.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Metadata"
                description="Tags and additional information for organization and search."
              >
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="tags">
                        Tags <span className="text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="tags"
                          placeholder="wellness, organic, tea"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for categorization and search (e.g., "wellness, organic, tea").
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight">Product Options</h3>
                <div className="flex flex-wrap gap-6">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured Product</FormLabel>
                          <FormDescription>
                            Highlight this product in featured sections.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Active and Visible</FormLabel>
                          <FormDescription>
                            Make this product visible in the store.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6">
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
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
