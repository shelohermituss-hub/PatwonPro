# 03 — Jesyon pwodwi ak envantè

## Objektif

Bay `owner` yon fason pou jere kategori ak pwodwi (kreye, modifye,
dezaktive, swiv stòk), e fè done sa yo disponib offline pou POS la.

## Depandans

Etap sa a depann de `02-auth.md` (wòl itilizatè).

## Sa pou fè

1. **Kategori** — CRUD senp `(dashboard)/products/categories`.
2. **Pwodwi**
   - Lis pwodwi ak rechèch (non/SKU) ak filtè pa kategori/stòk ba.
   - Fòm kreye/modifye (non, kategori, inite, pri achte, pri vann, kantite
     stòk, sèy alèt stòk ba).
   - Validasyon ak `zod` (pri >= 0, kantite >= 0).
3. **Senkronizasyon lokal**
   - Lè yon pwodwi kreye/modifye sou Supabase, mete kopi lokal Dexie a
     (`db.products`) ajou — swa pa yon `realtime` subscription Supabase, swa
     pa yon "pull" konplè lè aplikasyon an louvri/vin online.
   - Kreye `src/lib/sync/pullProducts.ts` ki senkronize `products` ak
     `categories` soti Supabase pou rive Dexie.
4. **Alèt stòk ba**
   - Sou paj pwodwi a, mete badge (`warning`) pou pwodwi kote
     `stock_quantity <= low_stock_threshold`.

## Kritè pou konsidere etap la fini

- [ ] `owner` ka kreye/modifye/dezaktive yon pwodwi.
- [ ] Lis pwodwi disponib nan Dexie apre yon premye chajman (teste offline).
- [ ] Alèt stòk ba parèt kòrèkteman.
- [ ] `employee` ka wè pwodwi yo men pa ka modifye yo (RLS + UI).

## Pwochen etap

Kontinye ak `04-pos.md`.
