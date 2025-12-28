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
import { AlertCircle, Check } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { CURRENCY } from "@/lib/constants";
import type { ProductFormValues } from "@/lib/schemas/productSchema";
import { unitOptions } from "@/lib/schemas/productSchema";

export function ProductPricing() {
  const form = useFormContext<ProductFormValues>();

  return (
    <FormSection
      title="Pricing & Inventory"
      description="Set product pricing and manage stock levels."
    >
      {/* Row 5: Price (20%) | Original Price (20%) | Stock (20%) | Low Stock (20%) | Unit (20%) */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <FormField
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
                      field.onChange(value === "" ? 0 : Number(value));
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
          control={form.control}
          name="originalPrice"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel htmlFor="originalPrice">
                Original Price{" "}
                <span className="text-muted-foreground text-xs">
                  (Optional)
                </span>
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
                        e.target.value === "" ? null : Number(e.target.value)
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
                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lowStockThreshold"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel htmlFor="lowStockThreshold">Low Stock</FormLabel>
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
                      e.target.value === "" ? null : Number(e.target.value)
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
  );
}
