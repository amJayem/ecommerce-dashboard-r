import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
  type CreateProductRequest,
} from "@/hooks/useProducts";
import { CURRENCY } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  PackagePlus,
  RefreshCw,
  Save,
  X,
} from "lucide-react";

const COMMON_TAGS = [
  "New Arrival",
  "Bestseller",
  "Limited Edition",
  "Sale",
  "Eco-friendly",
  "Handmade",
  "Vintage",
  "Premium",
  "Bundle",
  "Seasonal",
];
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

const unitOptions = [
  "pcs",
  "set",
  "box",
  "pack",
  "kg",
  "g",
  "lb",
  "liter",
  "ml",
] as const;

const productFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product Name is required")
      .max(255, "Name is too long"),
    slug: z
      .string()
      .min(1, "URL Slug is required")
      .regex(
        /^[a-z0-9-]+$/,
        "URL Slug can only contain lowercase letters, numbers, and hyphens"
      ),
    shortDescription: z
      .string()
      .max(500, "Short description is too long")
      .optional(),
    description: z.string().max(5000, "Description is too long").optional(),
    price: z.coerce
      .number()
      .min(0, "Price must be a positive number")
      .finite("Price must be a valid number"),
    originalPrice: z.coerce
      .number()
      .min(0, "Original price must be positive")
      .finite("Original price must be a valid number")
      .optional()
      .nullable(),
    stock: z.coerce
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock Quantity must be 0 or greater"),
    lowStockThreshold: z.coerce
      .number()
      .int("Threshold must be a whole number")
      .min(0, "Threshold cannot be negative")
      .optional()
      .nullable(),
    categoryId: z.coerce
      .number()
      .int("Category is required")
      .positive("Please select a category")
      .optional()
      .nullable(),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    featured: z.boolean().default(false),
    isActive: z.boolean().default(true),
    unit: z.enum(unitOptions).default("pcs"),
    weight: z.coerce
      .number()
      .min(0, "Weight must be positive")
      .finite("Weight must be a valid number")
      .optional()
      .nullable(),
    coverImage: z
      .string()
      .url("Cover image must be a valid URL")
      .optional()
      .or(z.literal("")),
    images: z.string().optional(),
    tags: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.originalPrice !== null &&
        data.originalPrice !== undefined &&
        data.originalPrice < data.price
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Original Price cannot be less than Sale Price",
      path: ["originalPrice"],
    }
  );

type ProductFormValues = z.infer<typeof productFormSchema>;

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
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
  );
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
  );
}

export function ProductForm() {
  const { productId } = useParams<{ productId?: string }>();
  const isEditMode = Boolean(productId);
  usePageTitle(isEditMode ? "Edit Product" : "Add Product");

  const navigate = useNavigate();
  // const { user } = useAuth();

  // const userRole = user?.role?.toLowerCase();
  // const isAdmin = userRole === "admin" || userRole === "super_admin";

  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitAction, setSubmitAction] = useState<"stay" | "exit">("exit"); // Default to exit for Create logic usually, but we'll control it explicitly.

  // React Query hooks
  const { data: product, isLoading: isLoadingProduct } = useProduct(
    isEditMode && productId ? Number(productId) : undefined
  );
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
    isRefetching: isRefetchingCategories,
  } = useCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const categoriesErrorMessage =
    categoriesError instanceof Error ? categoriesError.message : null;

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
  });

  const categoryDropdownOptions = useMemo(() => {
    return categories
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((category) => ({
        id: category.id,
        label: category.parent?.name
          ? `${category.parent.name} › ${category.name}`
          : category.name,
      }));
  }, [categories]);

  // Load product data into form when it's available
  useEffect(() => {
    if (product && isEditMode) {
      form.reset({
        name: product.name ?? "",
        slug: product.slug ?? "",
        shortDescription: product.shortDescription ?? product.description ?? "",
        description:
          product.detailedDescription ??
          product.description ??
          product.shortDescription ??
          "",
        price: product.price ?? 0,
        originalPrice: product.originalPrice ?? null,
        stock: product.stock ?? 0,
        lowStockThreshold: product.lowStockThreshold ?? null,
        categoryId: product.categoryId ?? null,
        status: product.status ?? "draft",
        featured: Boolean(product.featured),
        isActive: Boolean(product.isActive),
        unit: (product.unit as (typeof unitOptions)[number]) ?? "pcs",
        weight: product.weight ?? null,
        coverImage: product.coverImage ?? "",
        images: product.images?.join(", ") ?? "",
        tags: product.tags?.join(", ") ?? "",
      });
    }
  }, [product, isEditMode, form]);

  // Auto-slug logic
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const productName = form.watch("name");

  useEffect(() => {
    if (!isSlugEdited && productName && !isEditMode) {
      const slug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("slug", slug, { shouldValidate: true });
    }
  }, [productName, isSlugEdited, isEditMode, form]);

  // Featured Product Logic: Disable if status is Draft
  const status = form.watch("status");
  useEffect(() => {
    if (status === "draft") {
      form.setValue("featured", false);
    }
  }, [status, form]);

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setPageError(null);
    setSuccessMessage(null);

    try {
      const parseNumber = (val: number | null | undefined) =>
        val !== null && val !== undefined ? Number(val) : undefined;

      const tags =
        data.tags
          ?.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean) ?? [];

      const images =
        data.images
          ?.split(",")
          .map((url) => url.trim())
          .filter(Boolean) ?? [];

      const payload: CreateProductRequest = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        shortDescription: data.shortDescription?.trim() ?? "",
        description: data.description?.trim() ?? "",
        detailedDescription: data.description?.trim() ?? "",
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
      };

      if (isEditMode && productId) {
        await updateProductMutation.mutateAsync({
          id: Number(productId),
          ...payload,
        });
        toast.success("Product updated successfully");
        if (submitAction === "exit") {
          navigate(`/products`, { replace: true });
        }
      } else {
        await createProductMutation.mutateAsync(payload);
        toast.success("Product created successfully");
        navigate(`/products`, { replace: true });
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save product";
      toast.error(message);
      setPageError(message); // Keep for static error display if needed, or remove? Keeping for now as fallback.
    }
  };

  if (isEditMode && isLoadingProduct) {
    return <ProductFormSkeleton />;
  }

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
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-sm">{pageError}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
              <Save className="h-4 w-4" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}

          {Object.keys(form.formState.errors).length > 0 && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold text-sm">
                  Please correct the following errors:
                </p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {Object.values(form.formState.errors).map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
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
                {/* Row 1: Product Name (70%) | Category (30%) */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-10">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-1 md:col-span-7">
                        <FormLabel htmlFor="name">
                          Product Name{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="name"
                              placeholder="Enter product name"
                              {...field}
                            />
                            {fieldState.isDirty && !fieldState.invalid && (
                              <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-3">
                        <div className="flex items-center justify-between">
                          <FormLabel htmlFor="categoryId">Category</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => refetchCategories()}
                            disabled={
                              categoriesLoading || isRefetchingCategories
                            }
                            title="Refresh Categories"
                          >
                            <RefreshCw
                              className={`h-3 w-3 ${
                                isRefetchingCategories ? "animate-spin" : ""
                              }`}
                            />
                            <span className="sr-only">Refresh</span>
                          </Button>
                        </div>
                        <FormControl>
                          {categoriesErrorMessage ? (
                            <Input
                              id="categoryId"
                              type="number"
                              placeholder="Enter category ID"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === "" ? null : e.target.value
                                )
                              }
                            />
                          ) : (
                            <Select
                              id="categoryId"
                              disabled={categoriesLoading}
                              {...field}
                              value={field.value?.toString() ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value)
                                )
                              }
                            >
                              <option value="">
                                {categoriesLoading
                                  ? "Loading..."
                                  : "Select Category"}
                              </option>
                              {categoryDropdownOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: URL Slug */}
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="slug">
                        URL Slug{" "}
                        <span className="text-muted-foreground">
                          (Auto-generated)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            id="slug"
                            placeholder="product-url-slug"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setIsSlugEdited(true);
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setIsSlugEdited(false);
                              const name = form.getValues("name");
                              const slug = name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)+/g, "");
                              form.setValue("slug", slug, {
                                shouldValidate: true,
                              });
                            }}
                            title="Regenerate from Name"
                          >
                            <ArrowLeft className="h-4 w-4 rotate-180" />{" "}
                            {/* Reuse ArrowLeft as a 'Refresh' icon proxy or verify if RefreshCw exists */}
                            <span className="sr-only">Generate</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Unique URL identifier for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row 3: Short Description */}
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
                          placeholder="Enter a brief summary..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {field.value?.length || 0}/500 characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row 4: Full Description */}
                <FormField
                  // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="description">
                        Full Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="description"
                          placeholder="Enter detailed information..."
                          className="min-h-[160px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {field.value?.length || 0}/5000 characters
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <FormSection
                title="Pricing & Inventory"
                description="Set product pricing and manage stock levels."
              >
                {/* Row 5: Price (20%) | Original Price (20%) | Stock (20%) | Low Stock (20%) | Unit (20%) */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="price"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-1">
                        <FormLabel htmlFor="price">
                          Price <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-sans">
                              {CURRENCY.symbol}
                            </span>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === "" ? 0 : value);
                              }}
                              value={field.value ?? ""}
                            />
                            {fieldState.isDirty && !fieldState.invalid && (
                              <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel htmlFor="originalPrice">
                          Original Price
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-sans">
                              {CURRENCY.symbol}
                            </span>
                            <Input
                              id="originalPrice"
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === "" ? null : e.target.value
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel htmlFor="stock">
                          Stock <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="stock"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? 0 : value);
                            }}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel htmlFor="lowStockThreshold">
                          Low Stock
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="lowStockThreshold"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        {field.value !== null &&
                          field.value !== undefined &&
                          form.watch("stock") <= field.value && (
                            <p className="text-[0.8rem] font-medium text-amber-500 mt-1.5 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Low stock warning
                            </p>
                          )}
                        <FormDescription>
                          Alert when stock falls below this level.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
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
                {/* Row 6: Weight (40%) | Status (60%) */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-5">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel htmlFor="weight">Weight</FormLabel>
                        <FormControl>
                          <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          Used to calculate shipping rates (enter in kilograms).
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-3">
                        <FormLabel htmlFor="status">
                          Status <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select id="status" {...field}>
                            <option value="draft">Draft (Not visible)</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Controls visibility: Draft (hidden), Published
                          (visible), Archived (hidden but preserved).
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
                          Cover Image URL
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("cover-upload")
                                    ?.click()
                                }
                              >
                                <PackagePlus className="mr-2 h-4 w-4" />
                                Upload Image
                              </Button>
                              <Input
                                id="cover-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    field.onChange(url);
                                  }
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                OR
                              </span>
                              <Input placeholder="Enter image URL" {...field} />
                            </div>
                            {field.value && (
                              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                <img
                                  src={field.value}
                                  alt="Cover preview"
                                  className="h-full w-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute right-2 top-2 h-6 w-6"
                                  onClick={() => field.onChange("")}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          The main product image displayed in listings.
                        </FormDescription>
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
                          Additional Images
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document
                                    .getElementById("images-upload")
                                    ?.click()
                                }
                              >
                                <PackagePlus className="mr-2 h-4 w-4" />
                                Upload Images
                              </Button>
                              <Input
                                id="images-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(
                                    e.target.files || []
                                  );
                                  if (files.length) {
                                    const newUrls = files.map((file) =>
                                      URL.createObjectURL(file)
                                    );
                                    const currentUrls = field.value
                                      ? field.value
                                          .split(",")
                                          .map((u: string) => u.trim())
                                          .filter(Boolean)
                                      : [];
                                    field.onChange(
                                      [...currentUrls, ...newUrls].join(",")
                                    );
                                  }
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                OR
                              </span>
                              <Input
                                placeholder="Enter comma-separated URLs"
                                {...field}
                              />
                            </div>
                            {field.value && (
                              <div className="grid grid-cols-3 gap-2">
                                {field.value
                                  .split(",")
                                  .map((url: string, index: number) => {
                                    const trimmed = url.trim();
                                    if (!trimmed) return null;
                                    return (
                                      <div
                                        key={index}
                                        className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted"
                                      >
                                        <img
                                          src={trimmed}
                                          alt={`Preview ${index}`}
                                          className="h-full w-full object-cover"
                                        />
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute right-1 top-1 h-5 w-5"
                                          onClick={() => {
                                            const urls = (field.value || "")
                                              .split(",")
                                              .map((u: string) => u.trim())
                                              .filter(Boolean);
                                            const newUrls = urls
                                              .filter(
                                                (_: string, i: number) =>
                                                  i !== index
                                              )
                                              .join(",");
                                            field.onChange(newUrls);
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Additional images for the product gallery. You can
                          upload files or paste direct URLs.
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
                      <FormLabel htmlFor="tags">Tags</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-3">
                          {field.value && field.value.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {field.value.split(",").map((tag, index) => {
                                const trimmedTag = tag.trim();
                                if (!trimmedTag) return null;
                                return (
                                  <Badge
                                    key={`${trimmedTag}-${index}`}
                                    variant="secondary"
                                    className="px-2 py-1 text-sm bg-secondary/50 hover:bg-secondary/70 transition-colors"
                                  >
                                    {trimmedTag}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 ml-1.5 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        const currentTags =
                                          field.value
                                            ?.split(",")
                                            .map((t) => t.trim())
                                            .filter(Boolean) || [];
                                        const newTags = currentTags
                                          .filter((_, i) => i !== index)
                                          .join(",");
                                        field.onChange(newTags);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                      <span className="sr-only">
                                        Remove {trimmedTag}
                                      </span>
                                    </Button>
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                          <Input
                            id="tags"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === ",") {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val) {
                                  const currentTags =
                                    field.value
                                      ?.split(",")
                                      .map((t) => t.trim())
                                      .filter(Boolean) || [];

                                  // Split input by comma in case user pasted a list or typed "tag1,tag2"
                                  const newCandidates = val
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean);

                                  const uniqueToAdd = newCandidates.filter(
                                    (candidate) =>
                                      !currentTags.some(
                                        (existing) =>
                                          existing.toLowerCase() ===
                                          candidate.toLowerCase()
                                      )
                                  );

                                  if (uniqueToAdd.length > 0) {
                                    const newTags = [
                                      ...currentTags,
                                      ...uniqueToAdd,
                                    ].join(",");
                                    field.onChange(newTags);
                                  }

                                  if (
                                    uniqueToAdd.length < newCandidates.length
                                  ) {
                                    toast.error("Duplicate tags were skipped");
                                  }

                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                            list="common-tags"
                          />
                          <datalist id="common-tags">
                            {COMMON_TAGS.map((tag) => (
                              <option key={tag} value={tag} />
                            ))}
                          </datalist>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Type a tag and press Enter to add it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormSection>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight">
                  Product Options
                </h3>
                <div className="flex flex-wrap gap-6">
                  <FormField
                    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            disabled={status === "draft"}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Featured Product
                            {status === "draft" && (
                              <span className="text-xs font-normal text-muted-foreground ml-2">
                                (Disabled in Draft)
                              </span>
                            )}
                          </FormLabel>
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
                            checked={field.value ?? true}
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

              <div className="flex items-center justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/products")}
                >
                  Cancel
                </Button>

                {isEditMode ? (
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={
                        updateProductMutation.isPending || isLoadingProduct
                      }
                      onClick={() => setSubmitAction("stay")}
                    >
                      {updateProductMutation.isPending &&
                      submitAction === "stay" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update
                        </>
                      )}
                    </Button>
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={
                        updateProductMutation.isPending || isLoadingProduct
                      }
                      onClick={() => setSubmitAction("exit")}
                    >
                      {updateProductMutation.isPending &&
                      submitAction === "exit" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update & Go to List
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending}
                    onClick={() => setSubmitAction("exit")}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Product
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
