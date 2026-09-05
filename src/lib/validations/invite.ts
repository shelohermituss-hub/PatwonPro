import { z } from "zod";

export const inviteEmployeeSchema = z.object({
  email: z.email("Antre yon imèl valid."),
});

export type InviteEmployeeInput = z.infer<typeof inviteEmployeeSchema>;

const ADMIN_ROLES = [
  "super_admin",
  "operations_manager",
  "sales_agent",
  "field_agent",
  "support_agent",
  "finance_agent",
  "read_only",
] as const;

export const inviteAdminSchema = z.object({
  email: z.email("Antre yon imèl valid."),
  adminRole: z.enum(ADMIN_ROLES),
});

export type InviteAdminInput = z.infer<typeof inviteAdminSchema>;
