import { z } from "zod";

export const storeProfileSchema = z.object({
  name: z.string().trim().min(1, "Antre non boutik la.").max(100, "Non an twò long."),
  address: z.string().trim().max(200, "Adrès la twò long.").optional(),
  phone: z.string().trim().max(30, "Nimewo a twò long.").optional(),
});

export type StoreProfileFormInput = z.input<typeof storeProfileSchema>;
export type StoreProfileFormOutput = z.output<typeof storeProfileSchema>;
