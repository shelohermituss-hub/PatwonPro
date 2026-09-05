"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronDown,
  ArrowLeft,
  RefreshCcw,
  CalendarClock,
  Pause,
  Play,
  DollarSign,
  Tablet,
  CreditCard as CreditCardIcon,
  MessageSquarePlus,
  StickyNote,
  KeyRound,
  XCircle,
  PackageCheck,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmActionDialog } from "@/components/admin/ConfirmActionDialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { formatCurrencyHTG, formatDateTime } from "@/lib/format";
import { findStore } from "@/lib/admin/mock/stores";
import { MOCK_SUBSCRIPTIONS } from "@/lib/admin/mock/subscriptions";
import { MOCK_DEVICES } from "@/lib/admin/mock/devices";
import { MOCK_STORE_TRANSACTIONS } from "@/lib/admin/mock/transactions";
import { MOCK_SUPPORT_TICKETS } from "@/lib/admin/mock/support";
import { AUDIT_LOG_SEED } from "@/lib/admin/mock/auditLog";
import { STORE_STATUS_LABELS, SUBSCRIPTION_STATUS_LABELS, DEVICE_STATUS_LABELS, SUPPORT_STATUS_LABELS } from "@/lib/admin/labels";

type ActionKind =
  | "convert_trial"
  | "extend_trial"
  | "suspend"
  | "reactivate"
  | "reset_password"
  | "close_contract";

const ACTION_CONFIG: Record<
  ActionKind,
  { title: string; description: string; confirmLabel: string; destructive?: boolean; auditAction: string; successMessage: string }
> = {
  convert_trial: {
    title: "Konvèti esè a an kontra",
    description: "Boutik la ap pase nan estati aktif ak yon abònman peyan.",
    confirmLabel: "Konvèti",
    auditAction: "store.trial_converted",
    successMessage: "Esè a konvèti an kontra.",
  },
  extend_trial: {
    title: "Pwolonje esè a",
    description: "Ajoute 15 jou anplis nan peryòd esè gratis la.",
    confirmLabel: "Pwolonje 15 jou",
    auditAction: "store.trial_extended",
    successMessage: "Esè a pwolonje.",
  },
  suspend: {
    title: "Sispann kont la",
    description: "Boutik la p ap ka itilize aplikasyon an jiskaske li reyaktive.",
    confirmLabel: "Sispann",
    destructive: true,
    auditAction: "store.suspended",
    successMessage: "Kont la sispann.",
  },
  reactivate: {
    title: "Reyaktive kont la",
    description: "Boutik la ap ka itilize aplikasyon an ankò imedyatman.",
    confirmLabel: "Reyaktive",
    auditAction: "store.reactivated",
    successMessage: "Kont la reyaktive.",
  },
  reset_password: {
    title: "Reyinisyalize modpas",
    description: "Yon lyen reyinisyalizasyon ap voye bay pwopriyetè a.",
    confirmLabel: "Voye lyen",
    auditAction: "store.password_reset",
    successMessage: "Lyen reyinisyalizasyon voye.",
  },
  close_contract: {
    title: "Klotire kontra a",
    description: "Sa ap mete fen nan abònman an epi prepare rekiperasyon tablèt la. Aksyon sa a pa ka anile.",
    confirmLabel: "Klotire kontra",
    destructive: true,
    auditAction: "store.contract_closed",
    successMessage: "Kontra a klotire.",
  },
};

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const store = findStore(id);
  const [pendingAction, setPendingAction] = useState<ActionKind | null>(null);

  if (!store) notFound();

  const subscription = MOCK_SUBSCRIPTIONS.find((s) => s.storeId === id);
  const device = MOCK_DEVICES.find((d) => d.assignedStoreId === id);
  const transactions = MOCK_STORE_TRANSACTIONS.filter((t) => t.storeId === id);
  const tickets = MOCK_SUPPORT_TICKETS.filter((t) => t.storeId === id);
  const auditEntries = AUDIT_LOG_SEED.filter((entry) => entry.store_id === id);

  const action = pendingAction ? ACTION_CONFIG[pendingAction] : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/admin/stores"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit gap-1.5")}
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tounen nan lis boutik yo
      </Link>

      <AdminPageHeader
        title={store.name}
        description={`${store.ownerName} · ${store.zone}, ${store.city}`}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Aksyon
              <ChevronDown data-icon="inline-end" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setPendingAction("convert_trial")}>
                <PackageCheck data-icon="inline-start" aria-hidden />
                Konvèti esè an kontra
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPendingAction("extend_trial")}>
                <CalendarClock data-icon="inline-start" aria-hidden />
                Pwolonje esè a
              </DropdownMenuItem>
              {store.subscriptionStatus === "suspended" ? (
                <DropdownMenuItem onClick={() => setPendingAction("reactivate")}>
                  <Play data-icon="inline-start" aria-hidden />
                  Reyaktive kont
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setPendingAction("suspend")} variant="destructive">
                  <Pause data-icon="inline-start" aria-hidden />
                  Sispann kont
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <DollarSign data-icon="inline-start" aria-hidden />
                Chanje plan / pri
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tablet data-icon="inline-start" aria-hidden />
                Asiyen / ranplase tablèt
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon data-icon="inline-start" aria-hidden />
                Anrejistre yon peman
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquarePlus data-icon="inline-start" aria-hidden />
                Kreye yon tikè
              </DropdownMenuItem>
              <DropdownMenuItem>
                <StickyNote data-icon="inline-start" aria-hidden />
                Ajoute nòt entèn
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setPendingAction("reset_password")}>
                <KeyRound data-icon="inline-start" aria-hidden />
                Reyinisyalize modpas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPendingAction("close_contract")} variant="destructive">
                <XCircle data-icon="inline-start" aria-hidden />
                Klotire kontra
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <RefreshCcw data-icon="inline-start" aria-hidden />
                Prepare rekiperasyon tablèt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Estati</span>
            <StatusBadge {...STORE_STATUS_LABELS[store.subscriptionStatus]} className="w-fit" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Abònman</span>
            <span className="font-medium capitalize">{store.plan} — {formatCurrencyHTG(store.monthlyPriceHtg)}/mwa</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Device ID</span>
            <span className="font-medium">{store.deviceId ?? "Okenn"}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Dènye Sync</span>
            <span className="font-medium">{store.lastSyncAt ? formatDateTime(store.lastSyncAt) : "Jamè"}</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Vwè Jeneral</TabsTrigger>
          <TabsTrigger value="subscription">Abònman</TabsTrigger>
          <TabsTrigger value="device">Aparèy</TabsTrigger>
          <TabsTrigger value="usage">Itilizasyon</TabsTrigger>
          <TabsTrigger value="transactions">Tranzaksyon</TabsTrigger>
          <TabsTrigger value="support">Sipò</TabsTrigger>
          <TabsTrigger value="notes">Nòt</TabsTrigger>
          <TabsTrigger value="audit">Odit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enfòmasyon Boutik</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-secondary">Pwopriyetè</span><p className="font-medium">{store.ownerName}</p></div>
              <div><span className="text-text-secondary">Telefòn / WhatsApp</span><p className="font-medium">{store.phone}</p></div>
              <div><span className="text-text-secondary">Adrès</span><p className="font-medium">{store.zone}, {store.quarter}, {store.city}</p></div>
              <div><span className="text-text-secondary">Tip Komès</span><p className="font-medium">{store.businessType}</p></div>
              <div><span className="text-text-secondary">Ajan Responsab</span><p className="font-medium">{store.agentName}</p></div>
              <div><span className="text-text-secondary">Dat Enstalasyon</span><p className="font-medium">{store.installedAt ?? "—"}</p></div>
              <div><span className="text-text-secondary">Peman Mobil</span><p className="font-medium">{[store.usesMonCash && "MonCash", store.usesNatCash && "NatCash"].filter(Boolean).join(" · ") || "Okenn"}</p></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="pt-4">
          {subscription ? (
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-text-secondary">Estati</span><p><StatusBadge {...SUBSCRIPTION_STATUS_LABELS[subscription.status]} /></p></div>
                <div><span className="text-text-secondary">Plan</span><p className="font-medium capitalize">{subscription.plan}</p></div>
                <div><span className="text-text-secondary">Pri Mansyèl</span><p className="font-medium">{formatCurrencyHTG(subscription.monthlyPriceHtg)}</p></div>
                <div><span className="text-text-secondary">Montan Dwe</span><p className="font-medium">{formatCurrencyHTG(subscription.amountDueHtg)}</p></div>
                <div><span className="text-text-secondary">Dènye Peman</span><p className="font-medium">{subscription.lastPaymentDate ?? "—"}</p></div>
                <div><span className="text-text-secondary">Pwochen Echeans</span><p className="font-medium">{subscription.nextDueDate}</p></div>
                <div className="col-span-2"><span className="text-text-secondary">Aksyon Rekòmande</span><p className="font-medium">{subscription.recommendedAction}</p></div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="Pa gen abònman" compact />
          )}
        </TabsContent>

        <TabsContent value="device" className="pt-4">
          {device ? (
            <Card>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-text-secondary">Device ID</span><p className="font-medium">{device.id}</p></div>
                <div><span className="text-text-secondary">Estati</span><p><StatusBadge {...DEVICE_STATUS_LABELS[device.status]} /></p></div>
                <div><span className="text-text-secondary">Marak / Modèl</span><p className="font-medium">{device.brand} {device.model}</p></div>
                <div><span className="text-text-secondary">Nimewo Seri</span><p className="font-medium">{device.serialNumber}</p></div>
                <div><span className="text-text-secondary">Dènye Sync</span><p className="font-medium">{device.lastSyncAt ? formatDateTime(device.lastSyncAt) : "Jamè"}</p></div>
                <div><span className="text-text-secondary">Kontra</span><p className="font-medium">{device.contractNumber ?? "—"}</p></div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="Pa gen tablèt asiyen" compact />
          )}
        </TabsContent>

        <TabsContent value="usage" className="pt-4">
          <EmptyState
            title="Done itilizasyon pa disponib nan mòd demo a"
            description="Faz 2 backend ap konekte metrik reyèl vant/pwodwi pou boutik sa a."
            compact
          />
        </TabsContent>

        <TabsContent value="transactions" className="pt-4">
          {transactions.length === 0 ? (
            <EmptyState title="Pa gen tranzaksyon" compact />
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{t.type}</span>
                  <span className="font-medium">{formatCurrencyHTG(t.amountHtg)}</span>
                  <span className="text-text-secondary">{formatDateTime(t.date)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="support" className="pt-4">
          {tickets.length === 0 ? (
            <EmptyState title="Pa gen tikè sipò" compact />
          ) : (
            <div className="flex flex-col gap-2">
              {tickets.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{t.subject}</span>
                  <StatusBadge {...SUPPORT_STATUS_LABELS[t.status]} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="pt-4">
          <EmptyState title="Ou poko ajoute okenn nòt" description="Itilize meni Aksyon pou ajoute yon nòt entèn." compact />
        </TabsContent>

        <TabsContent value="audit" className="pt-4">
          {auditEntries.length === 0 ? (
            <EmptyState title="Pa gen antre nan jounal odit la pou boutik sa a" compact />
          ) : (
            <div className="flex flex-col gap-2">
              {auditEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                  <span>{entry.action}</span>
                  <span className="text-text-secondary">{formatDateTime(entry.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {action && pendingAction && (
        <ConfirmActionDialog
          open
          onOpenChange={(open) => !open && setPendingAction(null)}
          title={action.title}
          description={action.description}
          confirmLabel={action.confirmLabel}
          destructive={action.destructive}
          action={action.auditAction}
          resourceType="store"
          resourceId={store.id}
          storeId={store.id}
          successMessage={action.successMessage}
        />
      )}
    </div>
  );
}
