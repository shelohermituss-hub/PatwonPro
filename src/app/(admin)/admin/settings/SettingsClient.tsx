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
import { ThemeToggle } from "@/components/ThemeToggle";
import { can } from "@/lib/admin/permissions";
import { recordAuditEvent } from "@/lib/admin/auditLog";
import { savePlatformSettings } from "@/lib/admin/mutations/settings";
import type { PlatformSettingsData } from "@/lib/admin/queries/settings";

export function SettingsClient({
  settings,
  envClientIdConfigured,
}: {
  settings: PlatformSettingsData;
  envClientIdConfigured: boolean;
}) {
  const actor = useAdminActor();
  const readOnly = !can(actor.role, "manage_settings");
  const [saving, setSaving] = useState(false);
  const [starterPrice, setStarterPrice] = useState(String(settings.planPricesHtg.starter));
  const [standardPrice, setStandardPrice] = useState(String(settings.planPricesHtg.standard));
  const [proPrice, setProPrice] = useState(String(settings.planPricesHtg.pro));
  const [depositAmount, setDepositAmount] = useState(String(settings.depositAmountHtg));
  const [p1Sla, setP1Sla] = useState(settings.slaP1Label);
  const [gracePeriodDays, setGracePeriodDays] = useState(String(settings.gracePeriodDays));
  const [paymentGatewayClientId, setPaymentGatewayClientId] = useState(settings.paymentGatewayClientId);

  async function handleSave() {
    setSaving(true);
    try {
      const nextValues = {
        planPricesHtg: {
          starter: Number(starterPrice) || 0,
          standard: Number(standardPrice) || 0,
          pro: Number(proPrice) || 0,
        },
        depositAmountHtg: Number(depositAmount) || 0,
        gracePeriodDays: Number(gracePeriodDays) || 0,
        slaP1Label: p1Sla,
        paymentGatewayClientId: paymentGatewayClientId.trim(),
      };
      await savePlatformSettings(nextValues);
      await recordAuditEvent({
        actorId: actor.id,
        actorRole: actor.role,
        action: "settings.updated",
        resourceType: "platform_settings",
        resourceId: "platform_settings",
        metadata: nextValues,
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
          <CardTitle>Aparans</CardTitle>
          <CardDescription>
            Preferans pèsonèl — chak manm ekip la chwazi pou pwòp sesyon yo,
            pa gen efè sou lòt itilizatè.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Entegrasyon Peman — MonCash / NatCash</CardTitle>
          <CardDescription>
            Client ID gateway Pay&apos;m PLOP PLOP la (yon sèl API pou de founisè yo).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-4 sm:max-w-md">
            <Field>
              <FieldLabel htmlFor="gatewayClientId">Client ID</FieldLabel>
              <Input
                id="gatewayClientId"
                value={paymentGatewayClientId}
                onChange={(e) => setPaymentGatewayClientId(e.target.value)}
                disabled={readOnly}
                placeholder={envClientIdConfigured ? "Konfigire pa varyab anviwònman (PAYMENT_GATEWAY_CLIENT_ID)" : "Antre Client ID gateway a"}
                autoComplete="off"
              />
              <FieldDescription>
                {paymentGatewayClientId
                  ? "Valè sa a pran priyorite sou varyab anviwònman an."
                  : envClientIdConfigured
                    ? "Vid — aplikasyon an ap sèvi ak varyab anviwònman PAYMENT_GATEWAY_CLIENT_ID pou kounye a."
                    : "Vid, e pa gen varyab anviwònman konfigire — peman MonCash/NatCash p ap fonksyone jiskaske w antre yon Client ID."}
              </FieldDescription>
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
