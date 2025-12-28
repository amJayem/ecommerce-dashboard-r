import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormSection } from "./FormSection";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import type { ProductFormValues } from "@/lib/schemas/productSchema";

interface ProductOrganizationProps {
  status: "draft" | "published" | "archived";
}

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

export function ProductOrganization({ status }: ProductOrganizationProps) {
  const form = useFormContext<ProductFormValues>();

  return (
    <>
      <FormSection
        title="Metadata"
        description="Tags and additional information for organization and search."
      >
        <FormField
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

                          if (uniqueToAdd.length < newCandidates.length) {
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
          Product Details
        </h3>

        {/* Row 6: Weight (40%) | Status (60%) */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-5">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel htmlFor="weight">Weight (kg)</FormLabel>
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
                        e.target.value === "" ? null : Number(e.target.value)
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
                  Controls visibility: Draft (hidden), Published (visible),
                  Archived (hidden but preserved).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-semibold tracking-tight pt-4">
          Product Options
        </h3>
        <div className="flex flex-wrap gap-6">
          <FormField
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
    </>
  );
}
