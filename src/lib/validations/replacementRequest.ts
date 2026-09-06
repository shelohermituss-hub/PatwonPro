import { z } from "zod";

export const replacementRequestSchema = z.object({
  reason: z.string().trim().min(5, "Antre yon rezon.").max(1000, "Rezon an twò long."),
});

export type ReplacementRequestFormInput = z.input<typeof replacementRequestSchema>;
export type ReplacementRequestFormOutput = z.output<typeof replacementRequestSchema>;
