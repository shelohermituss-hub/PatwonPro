import { z } from "zod";

export const leadSchema = z.object({
  storeName: z.string().trim().min(2, "Antre non boutik la."),
  ownerName: z.string().trim().min(2, "Antre non pwopriyetè a."),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  address: z.string().trim().optional(),
  zone: z.string().trim().optional(),
  businessType: z.string().trim().optional(),
  estimatedProductCount: z.coerce.number().int().min(0).optional(),
  sellerCount: z.coerce.number().int().min(0).optional(),
  usesMobileMoney: z.boolean().default(false),
});

export type LeadFormInput = z.input<typeof leadSchema>;
export type LeadFormOutput = z.output<typeof leadSchema>;
