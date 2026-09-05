"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminActor, useSetAdminRole } from "@/components/admin/AdminSessionProvider";
import { ADMIN_ROLE_LABELS } from "@/lib/admin/permissions";
import type { AdminRole } from "@/types/admin";

const ROLES = Object.keys(ADMIN_ROLE_LABELS) as AdminRole[];

/** Lets the team preview nav/action visibility per role — mock only, see AdminSessionProvider. */
export function AdminRoleSwitcher() {
  const actor = useAdminActor();
  const setRole = useSetAdminRole();

  return (
    <Select value={actor.role} onValueChange={(value) => value && setRole(value as AdminRole)}>
      <SelectTrigger className="w-[180px]" aria-label="Chanje wòl (demo)">
        <SelectValue>{(value: string) => ADMIN_ROLE_LABELS[value as AdminRole]}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {ADMIN_ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
