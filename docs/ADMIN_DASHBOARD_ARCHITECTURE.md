# Jere Boutik Admin — Architecture

Back-office interne sou `/admin`, konplètman separe de l'app komèsan
(`(dashboard)`). Depi "phase 2 backend", **tout done ak aksyon yo reyèl**
— pa gen `MOCK_*` ki rete nan `src/app/(admin)/**` ankò.

## Vizyon

`/admin` dwe reponn rapid ak kesyon operasyonèl chak jou: konbyen boutik
peye, konbyen esè ap fini, MRR atann, lajan an reta, tablèt disponib,
tikè pou trete jodi a. Wè `docs/CLAUDE.md` pou kontèks pwodwi jeneral.

## Rezo aksè — 4 kouch, tout reyèl

1. **Gate back-office la** (`(admin)/layout.tsx`, sèvè) :
   `isPlatformAdmin(profile)` sou pwofil Supabase la — yon
   `owner`/`employee` pa ka rive sou `/admin` menm si li tape URL la
   dirèkteman.
2. **Gate chak paj espesifikman** (`src/lib/admin/guardNav.ts`,
   `requireNavAccess(nav)`) : chak nan 14 paj ki pa dashboard la rele l
   an premye — si `canSeeNav(profile.admin_role, nav)` fo (menm si
   `isPlatformAdmin` vre), redireksyon `/admin`. Avan sa, nenpòt
   sou-wòl te ka navige pa URL sou nenpòt paj menm si nav la kache —
   koulye a sa fèmen.
3. **7 wòl admin reyèl** (`profiles.admin_role`, migration 011) :
   `super_admin`, `operations_manager`, `sales_agent`, `field_agent`,
   `support_agent`, `finance_agent`, `read_only` — sèlman poze lè
   `role = 'platform_admin'` (contrainte). `AdminSessionProvider`
   (`src/components/admin/AdminSessionProvider.tsx`) pa mock ankò : li
   resevwa yon `AdminActor` konstwi sèvè-kote nan `(admin)/layout.tsx`
   soti nan `getCurrentProfile()`.
4. **De miwa pèmisyon ki dwe rete senkwonize manyèlman** :
   `src/lib/admin/permissions.ts` (`can(role, action)`, kontwòl UI —
   ki bouton/lyen parèt, e depi migrasyon 031/032/035/151 tout paj ki
   gen aksyon ekriti dezaktive kontwòl yo lè `can()` reponn fo, olye
   kite RLS bloke aksyon an twò ta) ak `admin_can(action text)`
   (fonksyon SQL, migration 011 — **se sèl vrè baryè**, RLS chèk li sou
   chak tab admin). Si youn chanje, chanje lòt la.

`stores` ak `profiles` te gen yon twou reyèl jiska migrasyon
031/032/035 : politik `stores_all_platform_admin`/
`profiles_all_platform_admin` orijinal yo te bay nenpòt sou-wòl (menm
`read_only`) dwa ekri kèlkeswa `admin_can()`, e yon **dezyèm** politik
`stores_update_owner` (FOR UPDATE) te gen menm twou a poukont li (RLS
konbine tout politik pèmisiv ak OR — sere youn pa sere lòt la). Twa
migrasyon sa yo egzije `admin_can('manage_stores')`/
`admin_can('manage_team')` sou chak branch `is_platform_admin()`,
verifye pa yon seri tès impèsonasyon (`read_only` bloke sou UPDATE,
`super_admin`/pwopriyetè toujou reyisi).

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
  guardNav.ts                    — `requireNavAccess(nav)`, gad pa paj
  installationChecklist.ts       — chèklis fiks sèd nouvo enstalasyon
  queries/*.ts                   — yon lekti pa domèn (stores, leads,
                                    deposits, installations, devices,
                                    subscriptions, support, transactions,
                                    sync, team, settings, analytics,
                                    auditLog, storeDetail, alerts)
  mutations/*.ts                 — ekriti client-side (`.update()`/
                                    `.insert()` filtre pa RLS), ladan
                                    `mutations/support.ts` (estati/
                                    priyorite/asiyasyon tikè)
  actions/*.ts                   — Server Actions ki bezwen service-role
                                    oswa yon sekrè sèvè (inviteAdmin,
                                    resetOwnerPassword,
                                    sendSubscriptionReminder — Twilio)
src/components/admin/
  AdminShell.tsx                 — sidebar sonm + header (rechèch reyèl
                                    → `/admin/stores?q=...`, konpayè
                                    notifikasyon ki reflete yon vrè
                                    konte alèt, wòl reyèl, dekoneksyon)
  AdminNav.tsx                   — lyen sidebar yo, filtre pa wòl reyèl
  AdminSessionProvider.tsx       — Context sou vrè AdminActor
  AdminDataTable.tsx             — tablo jenerik: rechèch (ak
                                    `initialSearch` pou pre-ranpli soti
                                    nan yon paramèt URL) + filt +
                                    paginasyon + ekspòte CSV + eta
                                    loading/vid/erè — itilize pa tout
                                    paj lis yo
  AdminPageHeader.tsx, KpiStat.tsx, StatusBadge.tsx,
  ConfirmActionDialog.tsx        — konfimasyon jenerik ak `onConfirm`
                                    **obligatwa** (pa gen aksyon fantòm
                                    ki ekri yon fo antre odit ankò) +
                                    audit_logs insert (skippab pa
                                    `skipAutoAudit` lè mutasyon an deja
                                    ekri pwòp antre l, tankou rapèl
                                    Twilio)
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
- `/admin/subscriptions` — sispann reyèl + rapèl reyèl SMS/WhatsApp
  (Twilio, `actions/sendSubscriptionReminder.ts`, sèvè-kote paske li
  bezwen `TWILIO_AUTH_TOKEN`) : voye toude kanal an paralèl, siksè si
  omwen youn pase, `last_reminder_at` sèlman mete ajou si yon kanal
  reyisi, erè klè si boutik la pa gen telefòn.
- `/admin/deposits` — fòm ajoute + Sheet pwosesis ki ekri estati reyèl.
- `/admin/devices` — envantè reyèl (`device_code` lizib, `store_id`
  aksepte null pou tablèt `in_stock` anvan asiyasyon). "Ajoute Tablèt"
  (Sheet) anrejistre yon modèl an antye an yon sèl kout : mak, modèl,
  foto (bucket `device-photos`, migration 030), ak kantite — chak inite
  vin yon liy `devices` separe, `in_stock`. Dyalòg "Asiyen a yon boutik"
  (menm patwon ke "Konvèti" lead) chanje `store_id`/`status` pou yon
  tablèt ki poko asiyen — depi migration 036, li kreye anmenmtan an yon
  liy `deposits` (`status: "pending"`) ak montan/mòd peman (yon sèl fwa
  oswa mansyalite) chwazi pa admin la, idanpotan (pa doub kreye si yon
  kosyon non-tèminal deja egziste pou aparèy la). Aksyon "Dezasiyen"
  (`ConfirmActionDialog`, sèlman vizib si aparèy la deja asiyen) fè
  chemen envès la (`store_id`/`installed_at` retounen `null`, `status`
  retounen `in_stock`) san touche kosyon an — ranbousman rete jere
  separeman sou `/admin/deposits`. Yon seksyon "Demand Ranplasman" anba
  tablo prensipal la liste `replacement_requests` an atant (kreye pa
  kòmèsan an sou `/subscription`), ak "Apwouve"/"Rejte"
  (`resolveReplacementRequest` + nòt opsyonèl) — apwouve pa asiyen yon
  nouvo tablèt otomatikman, admin toujou itilize dyalòg "Asiyen a yon
  boutik" nòmal la separeman.
- `/admin/installations` — fòm planifikasyon + chèklis entèraktif
  pèsistan.
- `/admin/support` — tablo + Kanban sou vrè `support_tickets`, ak vrè
  ekriti (`mutations/support.ts`) : chanje estati/priyorite (`Select` →
  `ConfirmActionDialog`) ak asiyen yon ajan (`AssignTicketDialog`,
  menm patwon ke "Asiyen a yon boutik" sou `/admin/devices`) — chak
  chanjman ekri `audit_logs`.
- `/admin/transactions` — "Finans Jere Boutik" (`platform_transactions`)
  vs "Tranzaksyon Boutik" (fizyon `sales` + `payment_transactions`).
- `/admin/sync` — sante reyèl (`devices.last_seen_at`/`pending_actions`/
  `sync_errors`, ranpli pa heartbeat la), "Kreye Tikè" kreye yon vrè
  tikè P1. "Relanse Sync" se yon vrè mekanis kounye a (pa t genyen anvan
  — te ekri yon fo antre odit san fè anyen) : li poze
  `devices.resync_requested_at`, valè sa a retounen nan repons
  `POST /api/sync/heartbeat` pou boutik la, e `src/lib/sync/index.ts`
  konpare l ak dènye valè li te sonje nan localStorage pou deklannche
  yon sèl relans fòse `syncAllPending({isForcedResync:true})`.
- `/admin/analytics` — agrega SQL, ak "Poko gen ase done" onèt kote
  pa gen siyal reyèl (retansyon pa kohòt, kou akizisyon kliyan).
- `/admin/team` — wozèt `profiles` reyèl + imèl/dènye koneksyon
  (`auth.users` via service-role), envitasyon admin reyèl, chanjman wòl
  pwoteje pa yon trigger `enforce_admin_role_change` (migration 028).
- `/admin/audit-log` — Server Component ki li `audit_logs` dirèkteman.
- `/admin/settings` — li/ekri `platform_settings` reyèl, ki gen ladan
  Client ID gateway peman MonCash/NatCash (Pay'm PLOP PLOP) — gade
  `src/lib/payments/gateway.ts`, ki li valè sa a anvan `PAYMENT_GATEWAY_CLIENT_ID`.

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
- **Dezaktive olye kite RLS bloke ta** : chak paj ki gen yon aksyon
  ekriti kalkile `const readOnly = !can(actor.role, "manage_xxx")` yon
  sèl fwa an tèt fichye a, epi pase `disabled={readOnly}` bay chak
  kontwòl konsène (bouton, `Select`, Sheet/Dialog trigger) — patwon
  etabli pa `SettingsClient.tsx`, kounye a repwodwi sou tout paj
  ekriti yo (`subscriptions`, `deposits`, `devices`, `leads`,
  `installations`, `sync`, `team`). RLS (`admin_can()`) rete sèl vrè
  baryè — sa a se yon konvenyans UX, pa yon ranplasman.

## Sa ki rete pou yon pwochen faz (pa `MOCK_*`, men limit reyèl kounye a)

- Retansyon pa kohòt ak kou akizisyon kliyan — pa gen ase istorik/done
  maketing pou kalkile yo.
- Aksyon "Chanje plan/pri", "Asiyen/ranplase tablèt", "Anrejistre yon
  peman", "Ajoute nòt entèn" sou fich boutik la (`/admin/stores/[id]`)
  rete dezaktive (`disabled`) — pa gen ase workflow espesifye pou yo
  ankò. ("Kreye yon tikè" soti nan lis sa a — li reyèl kounye a sou
  `/admin/sync` ak `/admin/support`.)
- Export CSV rete client-side (limit pa volim reyèl aktyèl la, ki fèb).
- `manage_transactions`/`delete_resource` : `manage_transactions` egziste
  nan matris la san UI ki itilize l ankò pou kounye a (pa gen aksyon
  ekriti sou `/admin/transactions`) ; `delete_resource` te retire
  antyèman (kòd mò — jamè yon vrè apèl ni yon RLS ki tcheke l).
