import type { AdminRole } from "@/types/admin";

/**
 * UI-only permission matrix for the admin back-office — decides which
 * nav links and action buttons a mocked `AdminActor` sees. This is NOT
 * real security: it exists so the interface already reflects the 7-role
 * model the user specified, and so a future Supabase RLS policy has an
 * exact 1:1 mapping to mirror (see docs/ADMIN_DASHBOARD_ARCHITECTURE.md).
 * The one real gate today is `isPlatformAdmin(profile)` in
 * `(admin)/layout.tsx`, checked server-side.
 */

export type AdminNavId =
  | "overview"
  | "stores"
  | "leads"
  | "trials"
  | "subscriptions"
  | "deposits"
  | "devices"
  | "installations"
  | "support"
  | "transactions"
  | "sync"
  | "analytics"
  | "team"
  | "auditLog"
  | "settings";

export type AdminAction =
  | "manage_stores"
  | "manage_subscriptions"
  | "manage_deposits"
  | "manage_devices"
  | "manage_installations"
  | "manage_support"
  | "manage_team"
  | "manage_settings"
  | "delete_resource";

const ALL_NAV: AdminNavId[] = [
  "overview",
  "stores",
  "leads",
  "trials",
  "subscriptions",
  "deposits",
  "devices",
  "installations",
  "support",
  "transactions",
  "sync",
  "analytics",
  "team",
  "auditLog",
  "settings",
];

const NAV_VISIBILITY: Record<AdminRole, AdminNavId[]> = {
  super_admin: ALL_NAV,
  operations_manager: [
    "overview",
    "stores",
    "leads",
    "trials",
    "devices",
    "installations",
    "support",
    "sync",
    "analytics",
  ],
  sales_agent: ["overview", "leads", "trials"],
  field_agent: ["overview", "installations", "devices", "support"],
  support_agent: ["overview", "stores", "support", "sync"],
  finance_agent: ["overview", "subscriptions", "deposits", "transactions"],
  read_only: ["overview", "stores", "subscriptions", "deposits", "devices", "support", "analytics"],
};

const ACTION_PERMISSIONS: Record<AdminRole, Set<AdminAction>> = {
  super_admin: new Set([
    "manage_stores",
    "manage_subscriptions",
    "manage_deposits",
    "manage_devices",
    "manage_installations",
    "manage_support",
    "manage_team",
    "manage_settings",
    "delete_resource",
  ]),
  operations_manager: new Set(["manage_stores", "manage_devices", "manage_installations", "manage_support"]),
  sales_agent: new Set([]),
  field_agent: new Set(["manage_installations"]),
  support_agent: new Set(["manage_support"]),
  finance_agent: new Set(["manage_subscriptions", "manage_deposits"]),
  read_only: new Set([]),
};

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Sipè Admin",
  operations_manager: "Manadjè Operasyon",
  sales_agent: "Ajan Vant",
  field_agent: "Ajan Teren",
  support_agent: "Ajan Sipò",
  finance_agent: "Ajan Finans",
  read_only: "Lekti Sèlman",
};

export function canSeeNav(role: AdminRole, nav: AdminNavId): boolean {
  return NAV_VISIBILITY[role].includes(nav);
}

export function visibleNav(role: AdminRole): AdminNavId[] {
  return ALL_NAV.filter((id) => canSeeNav(role, id));
}

export function can(role: AdminRole, action: AdminAction): boolean {
  return ACTION_PERMISSIONS[role].has(action);
}
