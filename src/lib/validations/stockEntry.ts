import { z } from "zod";

export const stockEntrySchema = z.object({
  productId: z.string().min(1, "Chwazi yon pwodwi."),
  entryType: z.enum(["restock", "correction", "adjustment"]),
  quantityDelta: z.coerce
    .number()
    .refine((v) => v !== 0, "Kantite a pa ka egal a 0."),
  reason: z.string().trim().max(500).optional(),
});

export type StockEntryFormInput = z.input<typeof stockEntrySchema>;
export type StockEntryFormOutput = z.output<typeof stockEntrySchema>;
