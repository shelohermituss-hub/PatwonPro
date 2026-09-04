import { z } from "zod";

export const creditSchema = z.object({
  customerId: z.string().min(1, "Chwazi yon kliyan."),
  amount: z.coerce.number().positive("Antre yon montan pi gran pase 0."),
});

export type CreditFormInput = z.input<typeof creditSchema>;
export type CreditFormOutput = z.output<typeof creditSchema>;

export function creditPaymentSchema(maxAmount: number) {
  return z.object({
    amount: z.coerce
      .number()
      .positive("Antre yon montan pi gran pase 0.")
      .max(maxAmount, `Montan an pa ka depase rès dèt la.`),
    paymentMethod: z.enum(["cash", "moncash", "natcash"]),
  });
}

export type CreditPaymentFormInput = z.input<ReturnType<typeof creditPaymentSchema>>;
export type CreditPaymentFormOutput = z.output<ReturnType<typeof creditPaymentSchema>>;
