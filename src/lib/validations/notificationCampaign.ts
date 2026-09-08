import { z } from "zod";

export const notificationCampaignSchema = z
  .object({
    title: z.string().min(3, "Tit la twò kout.").max(120),
    body: z.string().min(5, "Mesaj la twò kout.").max(500),
    targetScope: z.enum(["all_stores", "single_store", "admin_team"]),
    targetStoreId: z.string().optional(),
    triggerType: z.enum(["immediate", "scheduled_once", "recurring"]),
    scheduledAt: z.string().optional(),
    frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
    timeOfDay: z.string().optional(),
    dayOfWeek: z.string().optional(),
    dayOfMonth: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.targetScope === "single_store" && !values.targetStoreId) {
      ctx.addIssue({ code: "custom", path: ["targetStoreId"], message: "Chwazi yon boutik." });
    }
    if (values.triggerType === "scheduled_once" && !values.scheduledAt) {
      ctx.addIssue({ code: "custom", path: ["scheduledAt"], message: "Chwazi yon dat ak lè." });
    }
    if (values.triggerType === "recurring") {
      if (!values.frequency) ctx.addIssue({ code: "custom", path: ["frequency"], message: "Chwazi yon frekans." });
      if (!values.timeOfDay) ctx.addIssue({ code: "custom", path: ["timeOfDay"], message: "Chwazi yon lè." });
      if (values.frequency === "weekly" && !values.dayOfWeek) {
        ctx.addIssue({ code: "custom", path: ["dayOfWeek"], message: "Chwazi yon jou." });
      }
      if (values.frequency === "monthly" && !values.dayOfMonth) {
        ctx.addIssue({ code: "custom", path: ["dayOfMonth"], message: "Chwazi yon dat nan mwa a." });
      }
    }
  });

export type NotificationCampaignFormInput = z.input<typeof notificationCampaignSchema>;
export type NotificationCampaignFormOutput = z.output<typeof notificationCampaignSchema>;

/** Translates the simplified frequency picker into a standard 5-field cron expression. */
export function toRecurringCronExpression(values: NotificationCampaignFormOutput): string {
  const [hour, minute] = (values.timeOfDay ?? "08:00").split(":").map(Number);
  if (values.frequency === "daily") return `${minute} ${hour} * * *`;
  if (values.frequency === "weekly") return `${minute} ${hour} * * ${values.dayOfWeek ?? "1"}`;
  return `${minute} ${hour} ${values.dayOfMonth ?? "1"} * *`;
}
