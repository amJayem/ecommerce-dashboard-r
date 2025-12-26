import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";
import { PackagePlus, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { ProductFormValues } from "@/lib/schemas/productSchema";

export function ProductMedia() {
  const form = useFormContext<ProductFormValues>();

  return (
    <FormSection
      title="Media"
      description="Product images for display and marketing."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="coverImage">Cover Image URL</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("cover-upload")?.click()
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
                    <span className="text-sm text-muted-foreground">OR</span>
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
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="images">Additional Images</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("images-upload")?.click()
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
                        const files = Array.from(e.target.files || []);
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
                    <span className="text-sm text-muted-foreground">OR</span>
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
                                      (_: string, i: number) => i !== index
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
                Additional images for the product gallery. You can upload files
                or paste direct URLs.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
