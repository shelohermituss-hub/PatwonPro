"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_TEAM } from "@/lib/admin/mock/team";
import { ADMIN_ROLE_LABELS } from "@/lib/admin/permissions";
import { formatDateTime } from "@/lib/format";
import type { AdminRole, TeamMember } from "@/types/admin";

const ROLE_OPTIONS = Object.entries(ADMIN_ROLE_LABELS).map(([value, label]) => ({ value, label }));

const FILTERS: AdminFilter<TeamMember>[] = [
  { id: "role", label: "Wòl", options: ROLE_OPTIONS, predicate: (row, v) => row.role === (v as AdminRole) },
];

export default function TeamPage() {
  const [team, setTeam] = useState(MOCK_TEAM);

  function changeRole(id: string, role: AdminRole) {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  const columns: AdminColumn<TeamMember>[] = [
    { id: "name", header: "Non", csvValue: (r) => r.name, cell: (r) => <span className="font-medium">{r.name}</span> },
    { id: "email", header: "Imèl", csvValue: (r) => r.email, cell: (r) => r.email },
    { id: "role", header: "Wòl", csvValue: (r) => ADMIN_ROLE_LABELS[r.role], cell: (r) => (
      <Select value={r.role} onValueChange={(v) => v && changeRole(r.id, v as AdminRole)}>
        <SelectTrigger className="w-[190px]">
          <SelectValue>{(value: string) => ADMIN_ROLE_LABELS[value as AdminRole]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    ) },
    { id: "active", header: "Estati", csvValue: (r) => (r.active ? "Aktif" : "Inaktif"), cell: (r) => (
      <StatusBadge label={r.active ? "Aktif" : "Inaktif"} tone={r.active ? "positive" : "neutral"} />
    ) },
    { id: "lastLogin", header: "Dènye Koneksyon", csvValue: (r) => r.lastLoginAt ?? "—", cell: (r) => (r.lastLoginAt ? formatDateTime(r.lastLoginAt) : "Jamè") },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader title="Ekip & Wòl" description="Manm ekip entèn Jere Boutik ak wòl yo." />

      <AdminDataTable
        data={team}
        columns={columns}
        filters={FILTERS}
        searchPlaceholder="Chèche pa non oswa imèl..."
        searchPredicate={(row, q) => row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q)}
        getRowKey={(row) => row.id}
        exportFilename="ekip.csv"
        emptyTitle="Pa gen manm ekip"
      />
    </div>
  );
}
