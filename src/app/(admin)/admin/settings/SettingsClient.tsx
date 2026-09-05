"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/admin/permissions";
import { savePlatformSettings } from "@/lib/admin/mutations/settings";
import type { PlatformSettingsData } from "@/lib/admin/queries/settings";

export function SettingsClient({ settings }: { settings: PlatformSettingsData }) {
  const actor = useAdminActor();
  const readOnly = !can(actor.role, "manage_settings");
  const [saving, setSaving] = useState(false);
  const [starterPrice, setStarterPrice] = useState(String(settings.planPricesHtg.starter));
  const [standardPrice, setStandardPrice] = useState(String(settings.planPricesHtg.standard));
  const [proPrice, setProPrice] = useState(String(settings.planPricesHtg.pro));
  const [depositAmount, setDepositAmount] = useState(String(settings.depositAmountHtg));
  const [p1Sla, setP1Sla] = useState(settings.slaP1Label);
  const [gracePeriodDays, setGracePeriodDays] = useState(String(settings.gracePeriodDays));

  async function handleSave() {
    setSaving(true);
    try {
      await savePlatformSettings({
        planPricesHtg: {
          starter: Number(starterPrice) || 0,
          standard: Number(standardPrice) || 0,
          pro: Number(proPrice) || 0,
        },
        depositAmountHtg: Number(depositAmount) || 0,
        gracePeriodDays: Number(gracePeriodDays) || 0,
        slaP1Label: p1Sla,
      });
      toast.success("Paramèt platfòm anrejistre.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yon erè fèt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <AdminPageHeader
        title="Paramèt Platfòm"
        description={readOnly ? "Lekti sèlman — sèl Sipè Admin ka modifye paramèt sa yo." : "Konfigirasyon global aplike sou tout boutik yo."}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pri Plan</CardTitle>
          <CardDescription>Pri mansyèl pa defo pou chak plan (HTG)</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="starter">Starter</FieldLabel>
              <Input id="starter" value={starterPrice} onChange={(e) => setStarterPrice(e.target.value)} disabled={readOnly} />
            </Field>
            <Field>
              <FieldLabel htmlFor="standard">Standard</FieldLabel>
              <Input id="standard" value={standardPrice} onChange={(e) => setStandardPrice(e.target.value)} disabled={readOnly} />
            </Field>
            <Field>
              <FieldLabel htmlFor="pro">Pro</FieldLabel>
              <Input id="pro" value={proPrice} onChange={(e) => setProPrice(e.target.value)} disabled={readOnly} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kosyon & Rekouvreman</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="deposit">Montan Kosyon Standard (HTG)</FieldLabel>
              <Input id="deposit" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} disabled={readOnly} />
            </Field>
            <Field>
              <FieldLabel htmlFor="grace">Delè Gras (jou)</FieldLabel>
              <Input id="grace" value={gracePeriodDays} onChange={(e) => setGracePeriodDays(e.target.value)} disabled={readOnly} />
              <FieldDescription>Kantite jou apre echeans anvan sispansyon.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="p1sla">SLA Sipò P1</FieldLabel>
              <Input id="p1sla" value={p1Sla} onChange={(e) => setP1Sla(e.target.value)} disabled={readOnly} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {!readOnly && (
        <Button type="button" onClick={handleSave} disabled={saving} className="w-fit min-h-11">
          {saving && <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden />}
          Anrejistre chanjman yo
        </Button>
      )}
    </div>
  );
}
