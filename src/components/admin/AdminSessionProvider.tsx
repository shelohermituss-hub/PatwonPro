"use client";

import { createContext, useContext } from "react";
import type { AdminActor } from "@/types/admin";

const AdminSessionContext = createContext<AdminActor | null>(null);

/**
 * Real "who's logged in" for the admin back-office — `actor` is built
 * server-side in `(admin)/layout.tsx` from the authenticated profile's
 * `admin_role` (migration 011). Provided via context purely so nested
 * Client Components (`AdminNav`, `AdminHeader`, `ConfirmActionDialog`)
 * don't need it prop-drilled through every page.
 */
export function AdminSessionProvider({
  actor,
  children,
}: {
  actor: AdminActor;
  children: React.ReactNode;
}) {
  return <AdminSessionContext.Provider value={actor}>{children}</AdminSessionContext.Provider>;
}

export function useAdminActor(): AdminActor {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminActor must be used inside <AdminSessionProvider>");
  return ctx;
}
