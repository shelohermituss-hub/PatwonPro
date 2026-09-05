import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { fetchAuditLog } from "@/lib/admin/queries/auditLog";
import { ADMIN_ROLE_LABELS } from "@/lib/admin/permissions";
import { formatDateTime } from "@/lib/format";
import type { AdminRole, AuditLogEntry } from "@/types/admin";

function roleLabel(role: AuditLogEntry["actor_role"]) {
  if (!role) return "—";
  return ADMIN_ROLE_LABELS[role as AdminRole] ?? role;
}

const COLUMNS: AdminColumn<AuditLogEntry>[] = [
  { id: "action", header: "Aksyon", csvValue: (r) => r.action, cell: (r) => <span className="font-medium">{r.action}</span> },
  { id: "resource", header: "Resous", csvValue: (r) => `${r.resource_type}:${r.resource_id ?? ""}`, cell: (r) => (
    <span className="text-sm text-text-secondary">{r.resource_type} · {r.resource_id ?? "—"}</span>
  ) },
  { id: "store", header: "Boutik", csvValue: (r) => r.store_id ?? "—", cell: (r) => r.store_id ?? "—" },
  { id: "actor", header: "Aktè", csvValue: (r) => `${r.actor_name ?? r.actor_id ?? ""} (${roleLabel(r.actor_role)})`, cell: (r) => (
    <span className="text-sm">{r.actor_name ?? r.actor_id ?? "—"} <span className="text-text-secondary">· {roleLabel(r.actor_role)}</span></span>
  ) },
  { id: "reason", header: "Rezon", csvValue: (r) => r.reason ?? "", cell: (r) => <span className="text-text-secondary">{r.reason ?? "—"}</span> },
  { id: "date", header: "Dat", csvValue: (r) => r.created_at, cell: (r) => formatDateTime(r.created_at) },
];

export default async function AuditLogPage() {
  const entries = await fetchAuditLog();

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Jounal Odit"
        description="Chak aksyon sansib nan admin la anrejistre isit la, pèsistan nan baz done a."
      />

      <AdminDataTable
        data={entries}
        columns={COLUMNS}
        searchPlaceholder="Chèche pa aksyon oswa resous..."
        searchPredicate={(row, q) =>
          row.action.toLowerCase().includes(q) || (row.resource_id ?? "").toLowerCase().includes(q)
        }
        getRowKey={(row) => row.id}
        exportFilename="jounal-odit.csv"
        emptyTitle="Pa gen antre nan jounal odit la"
      />
    </div>
  );
}
