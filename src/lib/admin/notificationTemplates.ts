import type { NotificationCampaignType } from "@/types/admin";

/**
 * Predefined notification templates, each tied to a real action/event
 * in PatwonPro (a sale, a credit going overdue, a subscription
 * changing state, a replacement request being resolved, a support
 * ticket update...) — picking one in `NewNotificationCampaignSheet`
 * pre-fills Kalite/Tit/Mesaj so an admin can react to something they
 * just saw happen without writing the message from scratch each time.
 *
 * This is a quick-fill library for the *manual* campaign console —
 * distinct from the automatic system triggers already wired in code
 * (`sendSubscriptionReminder.ts`, the sync heartbeat, the daily
 * low-stock/overdue-credit cron) which fire on their own without an
 * admin picking anything here.
 */
export interface NotificationTemplate {
  id: string;
  /** Shown in the template picker, grouped by domain. */
  group: "Machann — Vant & Kredi" | "Machann — Aparèy & Abònman" | "Sipò & Platfòm";
  label: string;
  notificationType: NotificationCampaignType;
  category: string;
  title: string;
  body: string;
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "new_sale_milestone",
    group: "Machann — Vant & Kredi",
    label: "Etap vant enpòtan",
    notificationType: "success",
    category: "new_sale",
    title: "Bèl travay! 🎉",
    body: "Boutik ou fè yon bèl pwogrè nan vant resamman — kontinye konsa.",
  },
  {
    id: "credit_payment_received",
    group: "Machann — Vant & Kredi",
    label: "Ranbousman kredi resevwa",
    notificationType: "success",
    category: "credit_payment",
    title: "Ranbousman resevwa",
    body: "Nou konfime nou resevwa yon ranbousman kredi nan men yon kliyan.",
  },
  {
    id: "credit_overdue",
    group: "Machann — Vant & Kredi",
    label: "Kredi an reta",
    notificationType: "warning",
    category: "credit_overdue",
    title: "Kredi an reta",
    body: "Gen kredi kliyan ki an reta pou plis pase 30 jou — verifye lis kredi yo pou relanse kliyan yo.",
  },
  {
    id: "low_stock",
    group: "Machann — Vant & Kredi",
    label: "Stòk ba",
    notificationType: "warning",
    category: "low_stock",
    title: "Stòk ba",
    body: "Gen pwodwi ki rive nan sèy stòk ba yo — reapwovizyone pou pa manke vann.",
  },
  {
    id: "subscription_reminder",
    group: "Machann — Aparèy & Abònman",
    label: "Rapèl abònman",
    notificationType: "warning",
    category: "subscription_reminder",
    title: "Rapèl abònman",
    body: "Abònman Jere Boutik ou ap ekspire byento — peye pou evite koupi sèvis la.",
  },
  {
    id: "subscription_suspended",
    group: "Machann — Aparèy & Abònman",
    label: "Abònman sispann",
    notificationType: "urgent",
    category: "subscription_status",
    title: "Abònman sispann",
    body: "Abònman ou sispann poutèt reta peman — peye kounye a pou reyaktive aksè ou.",
  },
  {
    id: "subscription_reactivated",
    group: "Machann — Aparèy & Abònman",
    label: "Abònman reyaktive",
    notificationType: "success",
    category: "subscription_status",
    title: "Abònman reyaktive",
    body: "Mèsi pou peman an! Abònman ou aktif ankò.",
  },
  {
    id: "deposit_received",
    group: "Machann — Aparèy & Abònman",
    label: "Kosyon konfime",
    notificationType: "success",
    category: "deposit_status",
    title: "Kosyon konfime",
    body: "Nou konfime nou resevwa kosyon tablèt ou a.",
  },
  {
    id: "deposit_refunded",
    group: "Machann — Aparèy & Abònman",
    label: "Kosyon ranbouse",
    notificationType: "success",
    category: "deposit_status",
    title: "Kosyon ranbouse",
    body: "Kosyon tablèt ou a ranbouse — verifye kont ou.",
  },
  {
    id: "replacement_approved",
    group: "Machann — Aparèy & Abònman",
    label: "Demand ranplasman apwouve",
    notificationType: "success",
    category: "replacement_request",
    title: "Demand ranplasman apwouve",
    body: "Demand ranplasman tablèt ou a apwouve — n ap kontakte w pou pwograme enstalasyon an.",
  },
  {
    id: "replacement_rejected",
    group: "Machann — Aparèy & Abònman",
    label: "Demand ranplasman rejte",
    notificationType: "warning",
    category: "replacement_request",
    title: "Demand ranplasman rejte",
    body: "Demand ranplasman tablèt ou a pa apwouve pou kounye a — kontakte sipò pou plis detay.",
  },
  {
    id: "sync_error",
    group: "Machann — Aparèy & Abònman",
    label: "Pwoblèm senkwonizasyon",
    notificationType: "urgent",
    category: "sync_error",
    title: "Pwoblèm senkwonizasyon",
    body: "Nou remake yon pwoblèm senkwonizasyon sou aparèy ou a — verifye koneksyon entènèt li.",
  },
  {
    id: "support_ticket_new",
    group: "Sipò & Platfòm",
    label: "Nouvo tikè sipò",
    notificationType: "info",
    category: "support_ticket",
    title: "Nouvo tikè sipò",
    body: "Yon nouvo tikè sipò soumèt — ale nan Sipò pou reponn.",
  },
  {
    id: "support_ticket_resolved",
    group: "Sipò & Platfòm",
    label: "Tikè sipò rezoud",
    notificationType: "success",
    category: "support_ticket",
    title: "Tikè rezoud",
    body: "Tikè sipò ou te soumèt la rezoud. Ekri nou si w gen lòt kesyon.",
  },
  {
    id: "maintenance",
    group: "Sipò & Platfòm",
    label: "Antretyen pwograme",
    notificationType: "info",
    category: "admin_broadcast",
    title: "Antretyen pwograme",
    body: "Platfòm nan ap gen yon antretyen pwograme byento — sèvis ka koupe pou yon ti tan.",
  },
];
