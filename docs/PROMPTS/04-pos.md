# 04 — Ekran Pwen Vant (POS)

## Objektif

Bati ekran vant prensipal la: kesye a chwazi pwodwi, ranpli yon panye, chwazi
mwayen peman (kach oswa kredi — MonCash/NatCash vin nan `07-payments.md`), e
konplete vant lan **san bezwen entènèt**.

## Depandans

Etap sa a depann de `03-products.md` (pwodwi disponib lokalman nan Dexie).

## Sa pou fè

1. **Grid pwodwi**
   - `(dashboard)/sales/new/page.tsx` (chanje de `/pos` — gade Phase 3) li
     pwodwi yo dirèkteman nan Dexie (via `dexie-react-hooks`
     `useLiveQuery`), pa Supabase — POS la pa dwe depann de yon apèl rezo
     pou afiche pwodwi. `(dashboard)/sales/page.tsx` (istorik vant, ak
     filtè) ak `(dashboard)/sales/[id]/page.tsx` (detay yon vant) konplete
     modil la.
   - Tap sou yon kat pwodwi ajoute l nan panye a — jere pa `useCart`
     (`src/hooks/useCart.ts`), React state lokal.

2. **Panye ak total**
   - Konpozan `Cart` ki montre atik yo, kantite (+/-), soustotal, rabè
     opsyonèl, ak total.

3. **Kliyan (opsyonèl pou vant kach)**
   - Chwa yon kliyan egzistan (rechèch sou `db.customers`) oswa "kliyan
     jenerik" pou vant kach san non.

4. **Konplete vant**
   - Bouton "Peye" kreye yon `Sale` + `SaleItem[]` ak yon UUID jenere lokal
     (`crypto.randomUUID()`), anrejistre yo nan Dexie ak
     `sync_status: "pending"`, epi **dekremante `stock_quantity` lokalman**
     imedyatman (optimistic).
   - Deklanche `syncPendingSales()` (`src/lib/sync`) san bloke UI a (fire
     and forget) — si li echwe, vant lan rete "pending" pou pwochen eseye.

5. **Endikatè sync/offline** — deja fèt kòm enfrastrikti debaz
   (`src/components/SyncStatusBadge.tsx`, `src/hooks/useOnlineStatus.ts`,
   `src/hooks/usePendingSyncCount.ts`), monte nan
   `(dashboard)/layout.tsx`. Pa rekreye l — sèvi avè l, ajiste plasman/style
   si POS la bezwen yon lòt kote pou li parèt.

6. **Resi**
   - Apre yon vant konplete, montre yon rezime senp (li ka enprime oswa
     voye pa SMS pita — pa nan pòte etap sa a).

## Kritè pou konsidere etap la fini

- [ ] Yon vant ka fèt konplètman avyon-mòd (DevTools offline).
- [ ] Vant "pending" yo sync otomatikman lè koneksyon retabli.
- [ ] Stòk pwodwi a desann kòrèkteman apre chak vant.
- [ ] Endikatè sync la reflete eta reyèl la.

## Pwochen etap

Kontinye ak `05-credits.md`.
