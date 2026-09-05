import { z } from "zod";

export const depositSchema = z.object({
  storeId: z.string().min(1, "Chwazi yon boutik."),
  deviceId: z.string().optional(),
  contractNumber: z.string().trim().optional(),
  amountHtg: z.coerce.number().positive("Antre yon montan valab."),
  receivedDate: z.string().min(1, "Antre yon dat."),
});

export type DepositFormInput = z.input<typeof depositSchema>;
export type DepositFormOutput = z.output<typeof depositSchema>;
