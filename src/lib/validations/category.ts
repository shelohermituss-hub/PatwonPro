import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Antre yon non.").max(100, "Non an twò long."),
});

export type CategoryFormInput = z.input<typeof categorySchema>;
export type CategoryFormOutput = z.output<typeof categorySchema>;
