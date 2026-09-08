import { redirect } from "next/navigation";
import { Store, Smartphone, Users, MonitorCog, BellRing } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { isOwner } from "@/lib/auth/roles";
import { InviteEmployeeForm } from "@/components/InviteEmployeeForm";
import { StoreProfileForm } from "@/components/StoreProfileForm";
import { MobilePaymentConfigForm } from "@/components/MobilePaymentConfigForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationPreferencesForm } from "@/components/NotificationPreferencesForm";
import { EmptyState } from "@/components/EmptyState";
import { fetchNotificationPreferences, fetchNotificationLogs } from "@/lib/notifications/queries";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const [{ data: store }, { data: team }, notificationPreferences, notificationLogs] = await Promise.all([
    supabase.from("stores").select("*").eq("id", profile.store_id).maybeSingle(),
    supabase
      .from("profiles")
      .select("*")
      .eq("store_id", profile.store_id)
      .order("role"),
    fetchNotificationPreferences(profile.id),
    fetchNotificationLogs(profile.id),
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

      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store">
            <Store data-icon="inline-start" aria-hidden />
            Boutik
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Smartphone data-icon="inline-start" aria-hidden />
            Peman Mobil
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users data-icon="inline-start" aria-hidden />
            Ekip
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <MonitorCog data-icon="inline-start" aria-hidden />
            Aparans
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing data-icon="inline-start" aria-hidden />
            Notifikasyon
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">Enfòmasyon Boutik</h2>
            <p className="text-sm text-text-secondary">
              Non, adrès, telefòn ak logo boutik ou.
            </p>
          </div>
          <StoreProfileForm store={store} />
        </TabsContent>

        <TabsContent value="payments" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">Peman Mobil</h2>
            <p className="text-sm text-text-secondary">
              Nimewo ak kòd QR MonCash/NatCash pou resevwa peman nan pwen vant lan.
            </p>
          </div>
          <MobilePaymentConfigForm store={store} />
        </TabsContent>

        <TabsContent value="team" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">Ekip</h2>
            <p className="text-sm text-text-secondary">
              Envite yon anplwaye pou yo ka konekte epi vann nan boutik ou.
            </p>
          </div>

          <InviteEmployeeForm />

          {(team ?? []).length === 0 ? (
            <EmptyState
              illustration="team"
              compact
              title="Ou poko gen manm ekip"
              description="Envite yon anplwaye pou l parèt isit la."
            />
          ) : (
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
          )}
        </TabsContent>

        <TabsContent value="appearance" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">Aparans</h2>
            <p className="text-sm text-text-secondary">
              Chwazi si aplikasyon an klè, fonse, oswa swiv reglaj aparèy ou.
            </p>
          </div>
          <ThemeToggle />
        </TabsContent>

        <TabsContent value="notifications" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-foreground">Notifikasyon</h2>
            <p className="text-sm text-text-secondary">
              Chwazi ki alèt ou vle resevwa, epi aktive notifikasyon push sou aparèy sa a.
            </p>
          </div>
          <NotificationPreferencesForm
            profileId={profile.id}
            initialPreferences={notificationPreferences}
            initialLogs={notificationLogs}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
