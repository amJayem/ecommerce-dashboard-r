import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "./FormSection";
import { ArrowLeft, Check, RefreshCw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { ProductFormValues } from "@/lib/schemas/productSchema";

interface ProductBasicInfoProps {
  categoriesLoading: boolean;
  categoriesErrorMessage: string | null;
  refetchCategories: () => void;
  isRefetchingCategories: boolean;
  categoryDropdownOptions: { id: number; label: string }[];
  setIsSlugEdited: (edited: boolean) => void;
}

export function ProductBasicInfo({
  categoriesLoading,
  categoriesErrorMessage,
  refetchCategories,
  isRefetchingCategories,
  categoryDropdownOptions,
  setIsSlugEdited,
}: ProductBasicInfoProps) {
  const form = useFormContext<ProductFormValues>();

  return (
    <FormSection
      title="Basic Information"
      description="Essential product details that appear in listings and search results."
    >
      {/* Row 1: Product Name (70%) | Category (30%) */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-10">
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem className="col-span-1 md:col-span-7">
              <FormLabel htmlFor="name">
                Product Name <span className="text-destructive">*</span>
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
                  disabled={categoriesLoading || isRefetchingCategories}
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
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  >
                    <option value="">
                      {categoriesLoading ? "Loading..." : "Select Category"}
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
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="slug">
              URL Slug{" "}
              <span className="text-muted-foreground">(Auto-generated)</span>
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
        control={form.control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="shortDescription">Short Description</FormLabel>
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
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="description">Full Description</FormLabel>
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
  );
}
