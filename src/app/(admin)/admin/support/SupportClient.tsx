"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function TicketCard({ ticket }: { ticket: AdminSupportTicket }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{ticket.subject}</span>
          <StatusBadge {...SUPPORT_PRIORITY_LABELS[ticket.priority]} />
        </div>
        <span className="text-xs text-text-secondary">{ticket.storeName}</span>
        <span className="text-xs text-text-secondary">{categoryLabel(ticket.category)} · {ticket.assignedAgent}</span>
      </CardContent>
    </Card>
  );
}

export function SupportClient({ tickets }: { tickets: AdminSupportTicket[] }) {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const columns: AdminColumn<AdminSupportTicket>[] = [
    { id: "subject", header: "Sijè", csvValue: (r) => r.subject, cell: (r) => <span className="font-medium">{r.subject}</span> },
    { id: "store", header: "Boutik", csvValue: (r) => r.storeName, cell: (r) => r.storeName },
    { id: "category", header: "Kategori", csvValue: (r) => categoryLabel(r.category), cell: (r) => categoryLabel(r.category) },
    { id: "priority", header: "Priyorite", csvValue: (r) => r.priority, cell: (r) => <StatusBadge {...SUPPORT_PRIORITY_LABELS[r.priority]} /> },
    { id: "status", header: "Estati", csvValue: (r) => SUPPORT_STATUS_LABELS[r.status].label, cell: (r) => <StatusBadge {...SUPPORT_STATUS_LABELS[r.status]} /> },
    { id: "agent", header: "Ajan", csvValue: (r) => r.assignedAgent, cell: (r) => r.assignedAgent },
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
                      colTickets.map((t) => <TicketCard key={t.id} ticket={t} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
