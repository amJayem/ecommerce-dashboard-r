import { z } from "zod";

export const unitOptions = [
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

export const productFormSchema = z
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

export type ProductFormValues = z.infer<typeof productFormSchema>;
