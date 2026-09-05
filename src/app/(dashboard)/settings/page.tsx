import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/auth/roles";
import { InviteEmployeeForm } from "@/components/InviteEmployeeForm";
import { StoreProfileForm } from "@/components/StoreProfileForm";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_LABELS: Record<string, string> = {
  owner: "Pwopriyetè",
  employee: "Anplwaye",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  if (!isOwner(profile) || !profile?.store_id) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const [{ data: store }, { data: team }] = await Promise.all([
    supabase.from("stores").select("*").eq("id", profile.store_id).maybeSingle(),
    supabase
      .from("profiles")
      .select("*")
      .eq("store_id", profile.store_id)
      .order("role"),
  ]);

  if (!store) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-foreground">
          Paramèt Boutik ak Anplwaye
        </h1>
        <p className="text-text-secondary">
          Enfòmasyon boutik ou ak jesyon ekip ou.
        </p>
      </div>

      <StoreProfileForm store={store} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground">Ekip</h2>
          <p className="text-sm text-text-secondary">
            Envite yon anplwaye pou yo ka konekte epi vann nan boutik ou.
          </p>
        </div>

        <InviteEmployeeForm />

        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Non</TableHead>
                <TableHead>Wòl</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(team ?? []).map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium text-foreground">
                    {member.full_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.role === "owner" ? "default" : "secondary"}>
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
