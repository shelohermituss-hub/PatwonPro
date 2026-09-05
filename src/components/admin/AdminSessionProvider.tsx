"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { AdminActor, AdminRole } from "@/types/admin";

interface AdminSessionValue {
  actor: AdminActor;
  setRole: (role: AdminRole) => void;
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

/**
 * Mock "who's logged in" for the admin back-office — there is no real
 * per-admin-role session yet (see docs/ADMIN_DASHBOARD_ARCHITECTURE.md),
 * just the single real `platform_admin` gate in `(admin)/layout.tsx`.
 * The role switcher in the header lets the team preview how nav/actions
 * change per role while that real model is built.
 */
export function AdminSessionProvider({
  defaultRole = "super_admin",
  children,
}: {
  defaultRole?: AdminRole;
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<AdminRole>(defaultRole);

  const value = useMemo<AdminSessionValue>(
    () => ({
      actor: { id: "adm-001", name: "Shelo Hermitus", role },
      setRole,
    }),
    [role],
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminActor(): AdminActor {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminActor must be used inside <AdminSessionProvider>");
  return ctx.actor;
}

export function useSetAdminRole(): (role: AdminRole) => void {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useSetAdminRole must be used inside <AdminSessionProvider>");
  return ctx.setRole;
}
