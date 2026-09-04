# 06 — Rapò

## Objektif

Bay pwopriyetè a vizibilite sou pèfòmans boutik la: vant, pwodwi ki pi vann,
mwayen peman, ak alèt stòk.

## Depandans

Etap sa a depann de `04-pos.md` ak `05-credits.md` (done vant/kredi egziste).

## Sa pou fè

**Chanjman vs premye vèsyon dokiman sa a**: Phase 5 konkrè a pa mande "Rapò
kredi" (total dèt, top kliyan an reta) ni ekspòtasyon CSV ki te nan premye
plan an — yo rete pou yon pwochen pas si yo bezwen yo. Sa ki anba a se sa ki
reyèlman konstwi.

1. **Peryòd** (`(dashboard)/reports/page.tsx`, Server Component)
   - Onglè Jodi a / Semèn sa a / Mwa sa a / Pèsonalize — jere pa
     `?period=...` (ak `?from=...&to=...` pou pèsonalize), pa yon
     `useState` kliyan-kote: chanje onglè se yon navigasyon senp
     (`<Link>`/`<form method="get">`), sèvè a re-rann paj la ak nouvo
     done yo.
   - `src/lib/reports/period.ts` konvèti peryòd la an bòn dat egzat (fizo
     orè Ayiti, UTC-5 fiks — peyi a pa gen chanjman lè).

2. **KPI**
   - Total Vant, Pwofi Estime (pri vant mwens pri achte pou pwodwi ki gen
     `sale_items` — kredi manyèl san atik pa gen pwofi kalkile), Kantite
     Tranzaksyon, Panye Mwayèn.

3. **Tandans vant**
   - Grafik `AreaChart` (Recharts) — pa è pou "Jodi a", pa jou pou lòt
     peryòd yo.

4. **Repatisyon peman**
   - Grafik don (`PieChart` ak `innerRadius`) pa `payment_method`, ak yon
     lejann tèks + pousantaj bò kote l (jan `docs/UI_RULES.md` mande —
     pa janm koulè sèlman).

5. **Pwodwi ki pi vann**
   - Top 10 pa valè vant sou peryòd la.

6. **Alèt stòk ba**
   - Pa lye ak peryòd la (eta aktyèl envantè a) — repwodwi menm lojik
     `stock_quantity <= low_stock_threshold` ki nan `(dashboard)/products`.

7. **Done — fonksyon SQL, pa Dexie**
   - `supabase/migrations/00000000000005_report_functions.sql` — 4
     fonksyon (`report_summary`, `report_payment_breakdown`,
     `report_sales_trend`, `report_top_products`), tout `security
     invoker` (RLS sou `sales`/`sale_items`/`products` toujou aplike,
     `store_id_param` pa yon fason pou kontounen izolasyon pa boutik).
     `src/lib/reports/queries.ts` rele yo an paralèl (`Promise.all`) apre
     sèvè a fin rezoud peryòd la.

## Kritè pou konsidere etap la fini

- [x] Rapò vant montre chif kòrèk pou yon peryòd tès konni.
- [x] Top pwodwi kòrèk selon done tès yo.
- [ ] Ekspòtasyon CSV — pa fèt nan pas sa a.

## Pwochen etap

Kontinye ak `07-payments.md`.
