# 06 — Rapò

## Objektif

Bay pwopriyetè a vizibilite sou pèfòmans boutik la: vant, pwodwi ki pi vann,
mwayen peman, ak dèt kredi total.

## Depandans

Etap sa a depann de `04-pos.md` ak `05-credits.md` (done vant/kredi egziste).

## Sa pou fè

1. **Rapò vant** (`(dashboard)/reports/page.tsx`)
   - Filtè peryòd (jodi a, semèn sa a, mwa sa a, entèval pèsonalize).
   - Total vant, kantite tranzaksyon, mwayèn pa vant.
   - Répartisyon pa `payment_method` (kach / MonCash / NatCash / kredi).

2. **Pwodwi ki pi vann**
   - Top 10 pwodwi pa kantite/valè vann sou peryòd chwazi a — kalkile pa
     yon vi (`view`) oswa fonksyon SQL sou Supabase, pa nan Dexie (rapò yo
     mande done konplè, pa jis sa ki lokal).

3. **Rapò kredi**
   - Total dèt kredi tout kliyan, lis kliyan ak pi gwo balans, dèt an reta.

4. **Ekspòte**
   - Bouton "Ekspòte CSV" pou rapò vant (fonksyon senp kliyan-kote, pa gen
     bezwen backend adisyonèl).

5. **Pèfòmans**
   - Rapò yo se sèlman-lekti — itilize Server Components ak apèl Supabase
     dirèk (pa Dexie) pou pwofite endèks Postgres yo.

## Kritè pou konsidere etap la fini

- [ ] Rapò vant montre chif kòrèk pou yon peryòd tès konni.
- [ ] Top pwodwi kòrèk selon done tès yo.
- [ ] Ekspòtasyon CSV mache e li ka louvri nan Excel/Sheets.

## Pwochen etap

Kontinye ak `07-payments.md`.
