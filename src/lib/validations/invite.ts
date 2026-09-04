import { z } from "zod";

export const inviteEmployeeSchema = z.object({
  email: z.email("Antre yon imèl valid."),
});

export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;
