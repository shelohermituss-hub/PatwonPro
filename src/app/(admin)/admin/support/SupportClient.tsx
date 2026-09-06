"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
import { recordAuditEvent } from "@/lib/admin/auditLog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SUPPORT_STATUS_LABELS,
  SUPPORT_PRIORITY_LABELS,
  SUPPORT_CATEGORY_LABELS,
} from "@/lib/admin/labels";
import { updateTicketStatus, updateTicketPriority, assignTicket } from "@/lib/admin/mutations/support";
import { formatDateTime } from "@/lib/format";
import type { AdminSupportStatus, AdminSupportTicket, SupportCategory, SupportPriority } from "@/types/admin";

const STATUS_OPTIONS = Object.entries(SUPPORT_STATUS_LABELS).map(([value, meta]) => ({ value, label: meta.label }));
const PRIORITY_OPTIONS = Object.entries(SUPPORT_PRIORITY_LABELS).map(([value, meta]) => ({ value, label: meta.label }));
const CATEGORY_OPTIONS = Object.entries(SUPPORT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

function categoryLabel(category: SupportCategory | null) {
  return category ? SUPPORT_CATEGORY_LABELS[category] : "Pa klase";
}

const FILTERS: AdminFilter<AdminSupportTicket>[] = [
  { id: "status", label: "Estati", options: STATUS_OPTIONS, predicate: (row, v) => row.status === (v as AdminSupportStatus) },
  { id: "priority", label: "Priyorite", options: PRIORITY_OPTIONS, predicate: (row, v) => row.priority === (v as SupportPriority) },
  { id: "category", label: "Kategori", options: CATEGORY_OPTIONS, predicate: (row, v) => row.category === (v as SupportCategory) },
];

const KANBAN_COLUMNS: { status: AdminSupportStatus; label: string }[] = [
  { status: "open", label: "Louvri" },
  { status: "in_progress", label: "An Kou" },
  { status: "resolved", label: "Rezoud" },
  { status: "closed", label: "Fèmen" },
];

function AssignTicketDialog({
  ticket,
  agentOptions,
  onDone,
}: {
  ticket: AdminSupportTicket;
  agentOptions: { id: string; name: string }[];
  onDone: () => void;
}) {
  const actor = useAdminActor();
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState(ticket.assignedAgentId ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleAssign() {
    setSubmitting(true);
    try {
      await assignTicket(ticket.id, agentId || null);
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: "support.assigned",
        resourceType: "support_ticket",
        resourceId: ticket.id,
        storeId: ticket.storeId,
        metadata: { agentId: agentId || null },
      });
      toast.success("Tikè a asiyen.");
      setOpen(false);
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Asiyen
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asiyen {ticket.subject}</DialogTitle>
          <DialogDescription>Chwazi ajan ki responsab tikè sa a.</DialogDescription>
        </DialogHeader>
        <Select value={agentId || "none"} onValueChange={(v) => setAgentId(v === "none" ? "" : (v ?? ""))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pa asiyen">
              {(value: string) =>
                value === "none" || !value ? "Pa asiyen" : agentOptions.find((a) => a.id === value)?.name ?? "Pa asiyen"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="none">Pa asiyen</SelectItem>
              {agentOptions.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button type="button" disabled={submitting} onClick={handleAssign}>
            {submitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
            Konfime Asiyasyon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TicketCard({ ticket, agentOptions, onChangeStatus, onDone }: {
  ticket: AdminSupportTicket;
  agentOptions: { id: string; name: string }[];
  onChangeStatus: (ticket: AdminSupportTicket, status: AdminSupportStatus) => void;
  onDone: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{ticket.subject}</span>
          <StatusBadge {...SUPPORT_PRIORITY_LABELS[ticket.priority]} />
        </div>
        <span className="text-xs text-text-secondary">{ticket.storeName}</span>
        <span className="text-xs text-text-secondary">{categoryLabel(ticket.category)} · {ticket.assignedAgent}</span>
        <div className="flex items-center gap-1.5">
          <Select value={ticket.status} onValueChange={(v) => v && onChangeStatus(ticket, v as AdminSupportStatus)}>
            <SelectTrigger className="h-8 flex-1 text-xs">
              <SelectValue>{(value: string) => SUPPORT_STATUS_LABELS[value as AdminSupportStatus].label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <AssignTicketDialog ticket={ticket} agentOptions={agentOptions} onDone={onDone} />
        </div>
      </CardContent>
    </Card>
  );
}

function SupportPageContent({
  tickets,
  agentOptions,
}: {
  tickets: AdminSupportTicket[];
  agentOptions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [pendingStatus, setPendingStatus] = useState<{ ticket: AdminSupportTicket; status: AdminSupportStatus } | null>(null);
  const [pendingPriority, setPendingPriority] = useState<{ ticket: AdminSupportTicket; priority: SupportPriority } | null>(null);

  function handleDone() {
    setPendingStatus(null);
    setPendingPriority(null);
    router.refresh();
  }

  const columns: AdminColumn<AdminSupportTicket>[] = [
    { id: "subject", header: "Sijè", csvValue: (r) => r.subject, cell: (r) => <span className="font-medium">{r.subject}</span> },
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => r.storeName },
    { id: "category", header: "Kategori", csvValue: (r) => categoryLabel(r.category), cell: (r) => categoryLabel(r.category) },
    { id: "priority", header: "Priyorite", csvValue: (r) => r.priority, cell: (r) => (
      <Select value={r.priority} onValueChange={(v) => v && setPendingPriority({ ticket: r, priority: v as SupportPriority })}>
        <SelectTrigger className="w-[130px]">
          <SelectValue>{(value: string) => SUPPORT_PRIORITY_LABELS[value as SupportPriority].label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    ) },
    { id: "status", header: "Estati", csvValue: (r) => SUPPORT_STATUS_LABELS[r.status].label, cell: (r) => (
      <Select value={r.status} onValueChange={(v) => v && setPendingStatus({ ticket: r, status: v as AdminSupportStatus })}>
        <SelectTrigger className="w-[150px]">
          <SelectValue>{(value: string) => SUPPORT_STATUS_LABELS[value as AdminSupportStatus].label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    ) },
    { id: "agent", header: "Ajan", csvValue: (r) => r.assignedAgent, cell: (r) => (
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">{r.assignedAgent}</span>
        <AssignTicketDialog ticket={r} agentOptions={agentOptions} onDone={() => router.refresh()} />
      </div>
    ) },
    { id: "sla", header: "SLA", csvValue: (r) => r.slaDeadline, cell: (r) => formatDateTime(r.slaDeadline) },
  ];

  const kanbanTickets =
    priorityFilter === "all" ? tickets : tickets.filter((t) => t.priority === priorityFilter);

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Sipò"
        description="Tikè sipò ak entèvansyon — Louvri → An kou → Rezoud → Fèmen."
        actions={
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <Button
              type="button"
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("table")}
            >
              <List data-icon="inline-start" aria-hidden />
              Tablo
            </Button>
            <Button
              type="button"
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("kanban")}
            >
              <LayoutGrid data-icon="inline-start" aria-hidden />
              Kanban
            </Button>
          </div>
        }
      />

      {view === "table" ? (
        <AdminDataTable
          data={tickets}
          columns={columns}
          filters={FILTERS}
          initialFilterValues={initialStatus ? { status: initialStatus } : undefined}
          searchPlaceholder="Chèche pa sijè oswa boutik..."
          searchPredicate={(row, q) => row.subject.toLowerCase().includes(q) || row.storeName.toLowerCase().includes(q)}
          getRowKey={(row) => row.id}
          exportFilename="sipò.csv"
          emptyTitle="Pa gen tikè ki matche"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Priyorite">
                {(value: string) =>
                  value === "all" ? "Tout priyorite" : (PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? "Priyorite")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tout priyorite</SelectItem>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {KANBAN_COLUMNS.map((col) => {
              const colTickets = kanbanTickets.filter((t) => t.status === col.status);
              return (
                <div key={col.status} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                    <span className="text-xs text-text-secondary">{colTickets.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {colTickets.length === 0 ? (
                      <p className="rounded-md border border-dashed border-border p-3 text-center text-xs text-text-secondary">
                        Okenn tikè
                      </p>
                    ) : (
                      colTickets.map((t) => (
                        <TicketCard
                          key={t.id}
                          ticket={t}
                          agentOptions={agentOptions}
                          onChangeStatus={(ticket, status) => setPendingStatus({ ticket, status })}
                          onDone={() => router.refresh()}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingStatus && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPendingStatus(null)}
          title="Chanje estati tikè a"
          description={`Estati "${pendingStatus.ticket.subject}" ap vin "${SUPPORT_STATUS_LABELS[pendingStatus.status].label}".`}
          confirmLabel="Konfime"
          action="support.status_changed"
          resourceType="support_ticket"
          resourceId={pendingStatus.ticket.id}
          storeId={pendingStatus.ticket.storeId}
          successMessage="Estati tikè a mete ajou."
          onConfirm={() => updateTicketStatus(pendingStatus.ticket.id, pendingStatus.status)}
          onConfirmed={handleDone}
        />
      )}

      {pendingPriority && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPendingPriority(null)}
          title="Chanje priyorite tikè a"
          description={`Priyorite "${pendingPriority.ticket.subject}" ap vin "${SUPPORT_PRIORITY_LABELS[pendingPriority.priority].label}".`}
          confirmLabel="Konfime"
          action="support.priority_changed"
          resourceType="support_ticket"
          resourceId={pendingPriority.ticket.id}
          storeId={pendingPriority.ticket.storeId}
          successMessage="Priyorite tikè a mete ajou."
          onConfirm={() => updateTicketPriority(pendingPriority.ticket.id, pendingPriority.priority)}
          onConfirmed={handleDone}
        />
      )}
    </div>
  );
}

export function SupportClient({
  tickets,
  agentOptions,
}: {
  tickets: AdminSupportTicket[];
  agentOptions: { id: string; name: string }[];
}) {
  return (
    <Suspense>
      <SupportPageContent tickets={tickets} agentOptions={agentOptions} />
    </Suspense>
  );
}
