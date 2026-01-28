import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/use-page-title";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
  type CreateProductRequest,
} from "@/hooks/useProducts";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/schemas/productSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

// Components
import { ProductHeader } from "./components/ProductHeader";
import { ProductBasicInfo } from "./components/ProductBasicInfo";
import { ProductPricing } from "./components/ProductPricing";
import { ProductMedia } from "./components/ProductMedia";
import { ProductOrganization } from "./components/ProductOrganization";
import { ProductActions } from "./components/ProductActions";

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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductForm() {
  const { id: productId } = useParams();
  const isEditMode = Boolean(productId);
  const navigate = useNavigate();
  usePageTitle(isEditMode ? "Edit Product" : "Add Product");

  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitAction, setSubmitAction] = useState<"stay" | "exit">("exit");
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // React Query hooks
  const { data: product, isLoading: isLoadingProduct } = useProduct(
    productId ? Number(productId) : undefined,
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

  // Categories Dropdown Options
  const categoryDropdownOptions = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.id,
      label: cat.name,
    }));
  }, [categories]);

  const categoriesErrorMessage = categoriesError
    ? "Failed to load categories"
    : null;

  const form = useForm<ProductFormValues>({
    // @ts-expect-error - Type inference issue with z.coerce, but works at runtime
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
      categoryId: undefined,
      unit: "pcs",
      weight: 0,
      status: "draft",
      featured: false,
      isActive: true,
      coverImage: "",
      images: "",
      tags: "",
    },
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold ?? null,
        categoryId: product.categoryId ?? null, // Allows null/manual entry if category deleted
        unit: (product.unit as any) ?? "pcs",
        weight: product.weight ?? 0,
        status: product.status,
        featured: product.featured,
        isActive: product.isActive,
        coverImage: product.coverImage || "",
        images: product.images?.join(",") || "",
        tags: product.tags?.join(",") || "",
      });
      // Existing slug is populated, user hasn't edited it manually yet in this session
      setIsSlugEdited(true); // Don't auto-regenerate slug for existing product on load
    }
  }, [isEditMode, product, form]);

  // Handle Slug Autogeneration
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

  const onSubmit = async (data: ProductFormValues) => {
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
      setPageError(message);
    }
  };

  if (isEditMode && isLoadingProduct) {
    return <ProductFormSkeleton />;
  }

  return (
    <div className="space-y-8">
      <ProductHeader
        isEditMode={isEditMode}
        productId={productId ? Number(productId) : undefined}
        productName={product?.name}
      />

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
              <ProductBasicInfo
                categoriesLoading={categoriesLoading}
                categoriesErrorMessage={categoriesErrorMessage}
                refetchCategories={refetchCategories}
                isRefetchingCategories={isRefetchingCategories}
                categoryDropdownOptions={categoryDropdownOptions}
                setIsSlugEdited={setIsSlugEdited}
              />

              <ProductPricing />

              <ProductMedia />

              <ProductOrganization status={status} />

              <ProductActions
                isEditMode={isEditMode}
                createProductLoading={createProductMutation.isPending}
                updateProductLoading={updateProductMutation.isPending}
                isLoadingProduct={isLoadingProduct}
                navigate={navigate}
                submitAction={submitAction}
                setSubmitAction={setSubmitAction}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
