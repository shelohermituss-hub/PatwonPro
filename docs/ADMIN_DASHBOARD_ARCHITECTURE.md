# Jere Boutik Admin — Architecture (Phase 1 : UI + mock data)

Back-office interne sou `/admin`, konplètman separe de l'app komèsan
(`(dashboard)`). Sa a se **premye faz** — entèfas + done mockup, san
konesyon Supabase/MonCash/NatCash, jan itilizatè a te mande espesifikman.

## Vizyon

`/admin` dwe reponn rapid ak kesyon operasyonèl chak jou: konbyen boutik
peye, konbyen esè ap fini, MRR atann, lajan an reta, tablèt disponib,
tikè pou trete jodi a. Wè `docs/CLAUDE.md` pou kontèks pwodwi jeneral.

## Rezo aksè — 3 kouch

1. **Gate reyèl** (`(admin)/layout.tsx`, sèvè) : `isPlatformAdmin(profile)`
   sou pwofil Supabase la. Sa a se **sèl** verifikasyon ki egziste
   vreman jodi a — yon `owner`/`employee` pa ka rive sou `/admin` menm
   si li tape URL la dirèkteman.
2. **7 wòl admin mockup** (`AdminRole` nan `src/types/admin.ts`) :
   `super_admin`, `operations_manager`, `sales_agent`, `field_agent`,
   `support_agent`, `finance_agent`, `read_only`. Yon `AdminSessionProvider`
   (Context React, `src/components/admin/AdminSessionProvider.tsx`) mock
   yon `AdminActor` kouran, ak yon selektè wòl nan header la
   (`AdminRoleSwitcher`) pou demontre chanjman navigasyon/aksyon.
3. **Matris pèmisyon** (`src/lib/admin/permissions.ts`) : `visibleNav(role)`
   filtre lyen sidebar yo, `can(role, action)` deside si yon bouton
   aksyon parèt. **Sa a se ekran sèlman** — pa gen okenn RLS/backend
   dèyè li kounye a. Fòm li fèt pou vin miwa egzat yon pwochen policy
   Supabase (wè "Pwochen etap backend" pi ba).

## Relasyon ak done reyèl yo

`profiles`/`stores`/`subscriptions`/`devices`/`support_tickets` egziste
deja nan Supabase (`docs/DATA_MODEL.md`) — `platform_admin` deja gen
dwa ekri sou `subscriptions`/`devices` selon RLS aktyèl la. Se poutèt sa
`AdminSubscription`/`AdminDevice`/`AdminSupportTicket` (nan
`src/types/admin.ts`) se **vèsyon anrichi** menm antite sa yo (plis
kolòn : plan/pri/reta pou abònman, seri/mak/istorik reparasyon pou
aparèy, kategori/priyorite/SLA pou tikè) — **pa** yon lòt tab paralèl.

**Pwochen etap backend dwe `ALTER` tab ki egziste yo, pa kreye dwoub.**
Antite ki pa gen ekivalan reyèl ditou (leads, trials, deposits,
installations, transactions administratif, sync health, audit log,
team) ap bezwen migrasyon nèf konplètman.

## Estrikti fichye

```
src/types/admin.ts              — tout modèl domèn admin
src/lib/admin/
  permissions.ts                 — matris nav/aksyon pa wòl
  labels.ts                      — dictionè estati → {label, tone}
  auditLog.ts                    — store mock an memwa + useAuditLog()
  now.ts                         — "jodi a" fiks pou kalkil mockup yo
  mock/*.ts                      — done reyalis (12 boutik, abònman,
                                    kosyon, aparèy, lead/esè, sipò,
                                    tranzaksyon, sync, ekip, odit)
src/components/admin/
  AdminShell.tsx                 — sidebar sonm + header (rechèch,
                                    notifikasyon, wòl, dekoneksyon)
  AdminNav.tsx                   — lyen sidebar yo, filtre pa wòl
  AdminSessionProvider.tsx       — Context wòl mockup
  AdminRoleSwitcher.tsx          — chanjè wòl (demo pèmisyon)
  AdminDataTable.tsx             — tablo jenerik: rechèch + filt +
                                    paginasyon + ekspòte CSV + eta
                                    loading/vid/erè — itilize pa tout
                                    paj lis yo
  AdminPageHeader.tsx, KpiStat.tsx, StatusBadge.tsx,
  ConfirmActionDialog.tsx        — blòk repete yo
  StoreGrowthChart.tsx, MrrChart.tsx — grafik Recharts tablo bò a
src/app/(admin)/admin/           — 15 wout yo (wè pi ba)
docs/ADMIN_DASHBOARD_ARCHITECTURE.md — dokiman sa a
```

## Wout yo — 2 nivo pwofondè

**Nivo 1 (konplè, ak workflow)** : `/admin` (tablo bò), `/admin/stores`
+ `/admin/stores/[id]` (8 onglè + meni aksyon + `ConfirmActionDialog`),
`/admin/subscriptions` (relans/sispann), `/admin/deposits` (Sheet
pwosesis 9 etap), `/admin/devices` (meni aksyon pa aparèy),
`/admin/support` (tablo + Kanban).

**Nivo 2 (tablo fonksyonèl, mwens pwofondè)** : `/admin/leads`,
`/admin/trials`, `/admin/installations` (chèklis lekti sèlman nan
Sheet), `/admin/transactions` (2 onglè, revni platfòm vs vant boutik),
`/admin/sync`, `/admin/analytics`, `/admin/team` (chanjman wòl mockup),
`/admin/audit-log` (branche sou `useAuditLog()` — antre ki fèt pandan
sesyon an parèt vivan), `/admin/settings` (lekti sèlman pou non
`super_admin`).

## Desizyon kle

- **Tèm sonm scope, pa yon dezyèm design system** : `.admin-theme`
  (`globals.css`) redefini **sèlman** 8 varyab `--sidebar*` an ble-nwit
  (`#0F172A`). Rès aplikasyon an (`--primary`, `--success`, `--warning`,
  `--danger`, `--background`) rete menm tokens yo — zòn kontni admin lan
  klè paske `--background` deja `#F8FAFC`.
- **`AdminDataTable` jenerik** olye repwodwi rechèch/filt/paginasyon/CSV
  nan chak nan 11 paj lis yo — yon sèl kote pou korije si konpòtman an
  dwe chanje.
- **Jounal odit an memwa** (`recordAuditEvent`/`useAuditLog`) : chak
  konfimasyon nan `ConfirmActionDialog` ekri yon antre imedyatman
  vizib sou `/admin/audit-log`. Pèdi nan refresh — se mockup, pa yon tab
  `audit_logs` reyèl.
- **Kanban san drag-and-drop** pou faz sa a — chanjman estati ta pase pa
  yon meni sou kat la nan yon pwochen iterasyon, pa yon librè DnD.
- **`ADMIN_MOCK_NOW`** (`src/lib/admin/now.ts`) ranplase `Date.now()`
  nan kalkil "konbyen jou depi" pou rete pi ("purity" React) epi kenbe
  yon "jodi a" koyerant (5 septanm 2026) atravè tout paj yo.

## Pwochen etap backend (pa fèt nan faz sa a)

1. Kreye tab reyèl pou `leads`, `trials` (oswa yon sèl tab ak yon
   `stage`), `deposits`, `installations`, `sync_health` (oswa kalkile
   soti nan `sync_queue` ki egziste deja), `audit_logs` (fòm egzat
   bay pa itilizatè a, wè `AuditLogEntry`).
2. Ajoute kolòn ki manke sou `subscriptions`/`devices`/`support_tickets`
   pou yo matche vèsyon anrichi mockup la (plan/pri/reta, seri/mak/kou,
   kategori/priyorite/SLA).
3. Ranplase `AdminSessionProvider` mockup ak yon vrè modèl `admin_users`
   + `admin_role` — epi transfòme `src/lib/admin/permissions.ts` an
   policy RLS reyèl pou chak tab (aksyon UI yo deja make ki pèmisyon yo
   mande, sa fasilite tradiksyon an).
4. Konekte CSV export ak yon export sèvè (limit ranje) si volim done a
   depase sa yon ekspòte kliyan ka jere.
5. Konekte `/admin/transactions` (onglè "Tranzaksyon Boutik") ak done
   `payment_transactions`/`sales` reyèl yo — toujou kenbe separasyon
   klè ak revni Jere Boutik.
