"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminActor } from "@/components/admin/AdminSessionProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const actor = useAdminActor();
  const readOnly = actor.role !== "super_admin";
  const [starterPrice, setStarterPrice] = useState("1200");
  const [standardPrice, setStandardPrice] = useState("1800");
  const [proPrice, setProPrice] = useState("2500");
  const [depositAmount, setDepositAmount] = useState("6000");
  const [p1Sla, setP1Sla] = useState("Menm jou");
  const [gracePeriodDays, setGracePeriodDays] = useState("7");

  function handleSave() {
    toast.success("Paramèt platfòm anrejistre.");
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
        <Button type="button" onClick={handleSave} className="w-fit min-h-11">
          Anrejistre chanjman yo
        </Button>
      )}
    </div>
  );
}
