# 05 — Kredi kliyan ("fè kredi")

## Objektif

Anpil ti boutik ann Ayiti vann a kredi bay kliyan yo fè konfyans. Bati jesyon
kredi: swiv konbyen chak kliyan dwe, anrejistre vèsman, e alète lè yon limit
kredi pre pou depase.

## Depandans

Etap sa a depann de `04-pos.md` (peman `credit` deja disponib kòm yon
`payment_method` nan vant).

## Sa pou fè

**Chanjman vs premye vèsyon dokiman sa a**: plan orijinal la te santre sou
kliyan (yon sèl lis kliyan ak balans). Phase 4 konkrè a mande yon modil
santre sou chak *kredi* (chak dèt se pwòp anrejistreman pa li, ak pwòp
istorik vèsman pa li) — yo aplike l konsa: chak "kredi" se yon `Sale` ak
`payment_method: "credit"`, kit li sòti nan POS (`/sales/new`) kit li kreye
manyèlman (`/credits/new`, san `sale_items` — jis yon dèt sèk, pa yon vant
detaye pa pwodwi). De chemen sa yo parèt ansanm nan menm lis la.

1. **Lis kredi**
   - `(dashboard)/credits/page.tsx` — lis tout `sales` kote
     `payment_method = 'credit'`, ak pou chak youn: kantite total, total
     vèsman (`credit_payments` kote `sale_id` matche), rès pou peye, ak
     estati (`Aktif` / `An reta` / `Peye`).
   - Rechèch pa non kliyan, filtè pa estati, triye pa estati (an reta an
     premye) epi pa rès balans desandan.
   - Banyè anlè lis la montre konbyen kredi an reta genyen ak total yo si
     gen omwen youn.

2. **Kreye yon kredi manyèlman**
   - `(dashboard)/credits/new/page.tsx` — chwazi yon kliyan + antre yon
     montan, kreye yon `Sale` san `sale_items` (`src/lib/credits/createCredit.ts`).
   - Montre yon avètisman (non-bloklan) si sa ta fè balans kliyan an depase
     `credit_limit`.

3. **Detay kredi + vèsman**
   - `(dashboard)/credits/[id]/page.tsx` — enfòmasyon kredi a, istorik
     vèsman (`credit_payments`), ak yon bouton "Anrejistre yon vèsman"
     (`src/lib/credits/recordPayment.ts`) ki aksepte peman pasyèl oswa
     total (validasyon Zod anpeche depase rès la).
   - Bouton rapèl SMS/WhatsApp — **placeholder pou kounye a** (montre yon
     mesaj "ap disponib pita", pa gen entegrasyon reyèl).

4. **`customers.credit_balance` — trigger Postgres, pa apèl kliyan-kote**
   - Olye de yon fonksyon RPC pou chak sit ekriti (POS, `/credits/new`,
     retry sync), `supabase/migrations/00000000000003_credit_balance_triggers.sql`
     mete de trigger `after insert` (sou `sales` pou dèt, sou
     `credit_payments` pou vèsman) ki ajiste `credit_balance` otomatikman.
     Sa a garanti koyerans kèlkeswa chemen ekriti a, san risk doub-konte
     sou yon retry (upsert idanpotan sou id kliyan-jenere).

5. **Limit kredi**
   - Lè yon kesye eseye fè yon vant a kredi (POS oswa `/credits/new`) ki ta
     fè `credit_balance + montan > credit_limit`, montre yon avètisman
     (men pa bloke definitivman — se yon desizyon biznis pwopriyetè a ka
     pran).

6. **Alèt dèt an reta**
   - Yon kredi ki gen rès pou peye e ki gen plis pase `OVERDUE_DAYS` (30
     jou pa default, `src/lib/credits/status.ts`) san vèsman parèt kòm
     "an reta" (badge wouj), toude sou lis la ak sou paj detay la.

7. **Sync offline**
   - `credit_payments` yo anrejistre menm jan ak `sales`/`products` (lokal
     Dexie `sync_status: "pending"` → sync lè online,
     `src/lib/sync/creditPayments.ts`). Balans kliyan an ka kalkile
     lokalman kòm total dèt mwens total vèsman, men verite final la se
     sèvè a (trigger Postgres) apre sync.

## Kritè pou konsidere etap la fini

- [x] Yon vant a kredi ogmante `credit_balance` kliyan an kòrèkteman
      (trigger, apre sync).
- [x] Yon vèsman diminye `credit_balance` kòrèkteman (trigger, apre sync).
- [x] Avètisman limit kredi parèt san bloke vant lan.
- [x] Fonksyonalite a mache offline e sync apre.

## Pwochen etap

Kontinye ak `06-reports.md`.
