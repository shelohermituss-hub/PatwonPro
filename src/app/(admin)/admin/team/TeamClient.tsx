"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminDataTable, type AdminColumn, type AdminFilter } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { inviteAdminSchema, type InviteAdminInput } from "@/lib/validations/invite";
import { inviteAdmin } from "@/lib/admin/actions/inviteAdmin";
import { changeAdminRole } from "@/lib/admin/mutations/team";
import { ADMIN_ROLE_LABELS } from "@/lib/admin/permissions";
import { formatDateTime } from "@/lib/format";
import type { AdminRole, TeamMember } from "@/types/admin";

const ROLE_OPTIONS = Object.entries(ADMIN_ROLE_LABELS).map(([value, label]) => ({ value, label }));

const FILTERS: AdminFilter<TeamMember>[] = [
  { id: "role", label: "Wòl", options: ROLE_OPTIONS, predicate: (row, v) => row.role === (v as AdminRole) },
];

function InviteAdminSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteAdminInput>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: "", adminRole: "read_only" },
  });

  async function onSubmit(values: InviteAdminInput) {
    setFormError(null);
    const { error } = await inviteAdmin(values);
    if (error) {
      setFormError(error);
      return;
    }
    toast.success("Envitasyon voye.");
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button type="button" />}>
        <Plus data-icon="inline-start" aria-hidden />
        Envite Admin
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Envite yon Nouvo Admin</SheetTitle>
          <SheetDescription>Yo ap resevwa yon imèl pou fini konfigirasyon kont yo.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="email">Imèl</FieldLabel>
              <Input id="email" type="email" {...register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="adminRole">Wòl</FieldLabel>
              <select
                id="adminRole"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register("adminRole")}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>
          </FieldGroup>

          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}

          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
              Voye Envitasyon
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function TeamClient({ team }: { team: TeamMember[] }) {
  const router = useRouter();

  async function handleRoleChange(member: TeamMember, role: AdminRole) {
    try {
      await changeAdminRole(member.id, role);
      toast.success(`Wòl ${member.name} chanje.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    }
  }

  const columns: AdminColumn<TeamMember>[] = [
    { id: "name", header: "Non", csvValue: (r) => r.name, cell: (r) => <span className="font-medium">{r.name}</span> },
    { id: "email", header: "Imèl", csvValue: (r) => r.email, cell: (r) => r.email },
    { id: "role", header: "Wòl", csvValue: (r) => ADMIN_ROLE_LABELS[r.role], cell: (r) => (
      <Select value={r.role} onValueChange={(v) => v && handleRoleChange(r, v as AdminRole)}>
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
    { id: "lastLogin", header: "Dènye Koneksyon", csvValue: (r) => r.lastLoginAt ?? "—", cell: (r) => (r.lastLoginAt ? formatDateTime(r.lastLoginAt) : "Jamè") },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Ekip & Wòl"
        description="Manm ekip entèn Jere Boutik ak wòl yo."
        actions={<InviteAdminSheet />}
      />

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
