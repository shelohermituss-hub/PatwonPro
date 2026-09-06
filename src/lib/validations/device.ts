import { z } from "zod";

export const deviceBatchSchema = z.object({
  brand: z.string().trim().min(2, "Antre mak tablèt la."),
  model: z.string().trim().min(1, "Antre modèl tablèt la."),
  quantity: z.coerce.number().int().min(1, "Antre omwen 1 tablèt.").max(500, "Maksimòm 500 tablèt pou yon sèl kout."),
  importBatch: z.string().trim().optional(),
  actualCostHtg: z.coerce.number().min(0).optional(),
  purchaseDate: z.string().trim().optional(),
});

export type DeviceBatchFormInput = z.input<typeof deviceBatchSchema>;
export type DeviceBatchFormOutput = z.output<typeof deviceBatchSchema>;
