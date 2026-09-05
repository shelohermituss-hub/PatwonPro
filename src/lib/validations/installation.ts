import { z } from "zod";

export const installationSchema = z.object({
  storeName: z.string().trim().min(2, "Antre non boutik la."),
  leadId: z.string().optional(),
  contact: z.string().trim().optional(),
  address: z.string().trim().optional(),
  scheduledAt: z.string().optional(),
  agentId: z.string().optional(),
  deviceId: z.string().optional(),
});

export type InstallationFormInput = z.input<typeof installationSchema>;
export type InstallationFormOutput = z.output<typeof installationSchema>;
