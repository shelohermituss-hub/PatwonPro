import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Antre non kliyan an."),
  phone: z.string().trim().optional(),
  creditLimit: z.coerce.number().min(0, "Limit kredi a pa ka negatif.").default(0),
});

export type CustomerFormInput = z.input<typeof customerSchema>;
export type CustomerFormOutput = z.output<typeof customerSchema>;
