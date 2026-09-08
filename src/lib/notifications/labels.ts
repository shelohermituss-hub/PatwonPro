import type { NotificationCategory } from "@/types/admin";

export const NOTIFICATION_CATEGORY_LABELS: Record<NotificationCategory, string> = {
  subscription_reminder: "Rapèl abònman",
  low_stock: "Stòk ba",
  credit_overdue: "Kredi an reta",
  sync_error: "Erè senkwonizasyon",
  new_sale: "Nouvo vant",
  refund: "Ranbousman",
  admin_broadcast: "Anons platfòm",
};
