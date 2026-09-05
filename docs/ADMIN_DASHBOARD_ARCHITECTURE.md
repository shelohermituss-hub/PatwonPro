# Jere Boutik Admin — Architecture

Back-office interne sou `/admin`, konplètman separe de l'app komèsan
(`(dashboard)`). Depi "phase 2 backend", **tout done ak aksyon yo reyèl**
— pa gen `MOCK_*` ki rete nan `src/app/(admin)/**` ankò.

## Vizyon

`/admin` dwe reponn rapid ak kesyon operasyonèl chak jou: konbyen boutik
peye, konbyen esè ap fini, MRR atann, lajan an reta, tablèt disponib,
tikè pou trete jodi a. Wè `docs/CLAUDE.md` pou kontèks pwodwi jeneral.

## Rezo aksè — 3 kouch, tout reyèl

1. **Gate wout la** (`(admin)/layout.tsx`, sèvè) : `isPlatformAdmin(profile)`
   sou pwofil Supabase la — yon `owner`/`employee` pa ka rive sou
   `/admin` menm si li tape URL la dirèkteman.
2. **7 wòl admin reyèl** (`profiles.admin_role`, migration 011) :
   `super_admin`, `operations_manager`, `sales_agent`, `field_agent`,
   `support_agent`, `finance_agent`, `read_only` — sèlman poze lè
   `role = 'platform_admin'` (contrainte). `AdminSessionProvider`
   (`src/components/admin/AdminSessionProvider.tsx`) pa mock ankò : li
   resevwa yon `AdminActor` konstwi sèvè-kote nan `(admin)/layout.tsx`
   soti nan `getCurrentProfile()`.
3. **De miwa pèmisyon ki dwe rete senkwonize manyèlman** :
   `src/lib/admin/permissions.ts` (`can(role, action)`, kontwòl UI —
   ki bouton/lyen parèt) ak `admin_can(action text)` (fonksyon SQL,
   migration 011 — **se sèl vrè baryè**, RLS chèk li sou chak tab
   admin). Si youn chanje, chanje lòt la.

## Relasyon ak done reyèl yo

`profiles`/`stores`/`subscriptions`/`devices`/`support_tickets` te deja
egziste anvan back-office la (`docs/DATA_MODEL.md`). Yo te **anrichi
sou plas** (migrations 013-017 : `device_code`, `serial_number`,
`plan`/`price_htg` deja la, `category`/`priority`/`sla_deadline` sou
tikè, elatriye) — **pa** dupliye nan yon dezyèm tab. Sis (6) tab
antyèman nouvo te kreye pou konsèp ki pa t gen ekivalan ditou : `leads`,
`deposits`, `installations`, `platform_transactions`,
`platform_settings`, `audit_logs` (migrations 018-023).

Tout tab admin swiv menm patwon RLS : `SELECT` rezève
`is_platform_admin()`, ekriti rezève `is_platform_admin() AND
admin_can('manage_xxx')`. `audit_logs` se sèl eksepsyon — nenpòt
sou-wòl admin ka ekri yon antre odit (`is_platform_admin()` sèlman),
paske chak aksyon nan lòt tab yo dwe kite yon tras kèlkeswa ki wòl fè l.

## Estrikti fichye

```
src/types/admin.ts              — tout modèl domèn admin (anrichi ak
                                   dbId/actor_name/etc. kote yo bezwen
                                   diferansye kòd afichaj vs vrè UUID)
src/lib/admin/
  permissions.ts                 — matris nav/aksyon pa wòl (miwa admin_can())
  labels.ts                      — dictionè estati → {label, tone}
  auditLog.ts                    — insert Supabase reyèl (audit_logs)
  installationChecklist.ts       — chèklis fiks sèd nouvo enstalasyon
  queries/*.ts                   — yon lekti pa domèn (stores, leads,
                                    deposits, installations, devices,
                                    subscriptions, support, transactions,
                                    sync, team, settings, analytics,
                                    auditLog, storeDetail)
  mutations/*.ts                 — ekriti client-side (`.update()`/
                                    `.insert()` filtre pa RLS)
  actions/*.ts                   — Server Actions ki bezwen service-role
                                    (inviteAdmin, resetOwnerPassword)
src/components/admin/
  AdminShell.tsx                 — sidebar sonm + header (rechèch,
                                    notifikasyon, wòl reyèl, dekoneksyon)
  AdminNav.tsx                   — lyen sidebar yo, filtre pa wòl reyèl
  AdminSessionProvider.tsx       — Context sou vrè AdminActor
  AdminDataTable.tsx             — tablo jenerik: rechèch + filt +
                                    paginasyon + ekspòte CSV + eta
                                    loading/vid/erè — itilize pa tout
                                    paj lis yo
  AdminPageHeader.tsx, KpiStat.tsx, StatusBadge.tsx,
  ConfirmActionDialog.tsx        — konfimasyon jenerik ak `onConfirm`
                                    (mutasyon reyèl) + audit_logs insert
  StoreGrowthChart.tsx, MrrChart.tsx — grafik Recharts sou vrè agrega
src/app/(admin)/admin/           — 15 wout yo, chak Server Component
                                    (fetch) + yon `*Client.tsx` (UI/état)
src/app/api/sync/heartbeat/      — mizajou devices.last_seen_at/
                                    pending_actions/sync_errors
docs/ADMIN_DASHBOARD_ARCHITECTURE.md — dokiman sa a
```

## Wout yo

Tout 15 wout yo li de vrè tab. Sa ki gen aksyon reyèl konfime pa
`ConfirmActionDialog`/fòm dedye :

- `/admin` — dashboard, agrega SQL sou 6 domèn.
- `/admin/stores` + `/admin/stores/[id]` — CRM rollup + 8 onglè, aksyon
  (konvèti esè, pwolonje, sispann/reyaktive, reyinisyalize modpas,
  klotire kontra) ekri sou `subscriptions` reyèl.
- `/admin/leads`, `/admin/trials` — pipeline reyèl, fòm ajoute lead,
  chanjman etap, Dialog "Konvèti" (lye a yon vrè boutik ki egziste).
- `/admin/subscriptions` — relans/sispann reyèl.
- `/admin/deposits` — fòm ajoute + Sheet pwosesis ki ekri estati reyèl.
- `/admin/devices` — envantè reyèl (`device_code` lizib, `store_id`
  aksepte null pou tablèt `in_stock` anvan asiyasyon).
- `/admin/installations` — fòm planifikasyon + chèklis entèraktif
  pèsistan.
- `/admin/support` — tablo + Kanban sou vrè `support_tickets`.
- `/admin/transactions` — "Finans Jere Boutik" (`platform_transactions`)
  vs "Tranzaksyon Boutik" (fizyon `sales` + `payment_transactions`).
- `/admin/sync` — sante reyèl (`devices.last_seen_at`/`pending_actions`/
  `sync_errors`, ranpli pa heartbeat la), "Kreye Tikè" kreye yon vrè
  tikè P1.
- `/admin/analytics` — agrega SQL, ak "Poko gen ase done" onèt kote
  pa gen siyal reyèl (retansyon pa kohòt, kou akizisyon kliyan).
- `/admin/team` — wozèt `profiles` reyèl + imèl/dènye koneksyon
  (`auth.users` via service-role), envitasyon admin reyèl, chanjman wòl
  pwoteje pa yon trigger `enforce_admin_role_change` (migration 028).
- `/admin/audit-log` — Server Component ki li `audit_logs` dirèkteman.
- `/admin/settings` — li/ekri `platform_settings` reyèl.

## Desizyon kle

- **Tèm sonm scope, pa yon dezyèm design system** : `.admin-theme`
  (`globals.css`) redefini **sèlman** 8 varyab `--sidebar*` an ble-nwit
  (`#0F172A`). Rès aplikasyon an rete menm tokens yo.
- **`AdminDataTable` jenerik** olye repwodwi rechèch/filt/paginasyon/CSV
  nan chak paj lis — done pase kòm props soti nan yon Server Component
  ki fè lekti Supabase la.
- **Server Component + `*Client.tsx`** : chak wout gen yon `page.tsx`
  san `"use client"` ki fè `await fetch...()`, ki pase rezilta a bay yon
  Client Component vwazen pou tablo/fòm/dyalòg entèraktif yo.
  `router.refresh()` apre chak mutasyon reyèl pou paj la relè done fre.
- **`enforce_admin_role_change`** : `profiles_all_platform_admin` (FOR
  ALL, migration 001) twò laj pou fine-grain chanjman `admin_role` —
  yon trigger separe egzije `admin_can('manage_team')` espesifikman sou
  chanjman chan sa a, san afekte lòt operasyon platform_admin sou
  `profiles`.
- **Pa gen istorik MRR** : grafik "Lajan Antre pa Mwa" sèlman chate
  `platform_transactions` reyèl (yon vrè seri tan) — MRR se yon chif
  "kounye a" (KPI), pa yon tandans envante san istorik reyèl dèyè li.

## Sa ki rete pou yon pwochen faz (pa `MOCK_*`, men limit reyèl kounye a)

- Retansyon pa kohòt ak kou akizisyon kliyan — pa gen ase istorik/done
  maketing pou kalkile yo.
- Aksyon "Chanje plan/pri", "Asiyen/ranplase tablèt", "Anrejistre yon
  peman", "Kreye yon tikè", "Ajoute nòt entèn" sou fich boutik la rete
  dezaktive (`disabled`) — pa gen ase workflow espesifye pou yo ankò.
- Export CSV rete client-side (limit pa volim reyèl aktyèl la, ki fèb).
