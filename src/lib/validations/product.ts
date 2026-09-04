import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Non pwodwi a twò kout."),
  sku: z.string().trim().optional(),
  categoryId: z.string().optional(),
  unit: z.string().trim().min(1, "Antre yon inite (ex: inite, liv, galon)."),
  costPrice: z.coerce.number().min(0, "Pri achte pa ka negatif."),
  salePrice: z.coerce.number().min(0, "Pri vann pa ka negatif."),
  stockQuantity: z.coerce.number().min(0, "Kantite pa ka negatif."),
  lowStockThreshold: z.coerce.number().min(0, "Sèy la pa ka negatif."),
  isActive: z.boolean(),
});

export type ProductFormInput = z.infer<typeof productSchema>;
