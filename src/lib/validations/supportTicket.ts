import { z } from "zod";

export const supportTicketSchema = z.object({
  subject: z.string().trim().min(2, "Antre yon sijè.").max(150, "Sijè a twò long."),
  message: z.string().trim().min(5, "Antre yon mesaj.").max(2000, "Mesaj la twò long."),
});

export type SupportTicketFormInput = z.input<typeof supportTicketSchema>;
export type SupportTicketFormOutput = z.output<typeof supportTicketSchema>;
