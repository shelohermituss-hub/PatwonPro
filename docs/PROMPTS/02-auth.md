# 02 — Otantifikasyon ak wòl itilizatè

## Objektif

Pèmèt yon pwopriyetè boutik kreye kont, konekte, kreye boutik li, epi envite
manadjè/kesye. Aplike wòl (`owner`/`manager`/`cashier`) atravè tout aplikasyon
an.

## Depandans

Etap sa a depann de `01-setup.md` (kliyan Supabase, migrasyon inisyal).

## Sa pou fè

1. **Enskripsyon pwopriyetè**
   - Paj `(auth)/register` — kreye kont Supabase Auth (email + modpas), epi
     kreye yon ranje `stores` ak yon ranje `profiles` (`role = "owner"`) nan
     yon sèl transaksyon (sèvi ak yon Postgres function/RPC pou atomicite).

2. **Koneksyon**
   - Ranpli `(auth)/login/page.tsx` ak yon fòm ki sèvi ak
     `supabase.auth.signInWithPassword`.
   - Redireksyon apre siksè: `/pos` (dashboard).

3. **Pwoteksyon wout**
   - `src/middleware.ts` (deja egziste) dwe redirije itilizatè ki pa
     konekte yo bay `/login` lè yo eseye rive nan `(dashboard)/*`.
   - Kreye yon `getCurrentProfile()` helper (`src/lib/supabase/`) ki li
     `profiles` pou itilizatè aktyèl la, itilize l nan layout dashboard la
     pou afiche non/wòl.

4. **Envitasyon ekip**
   - Yon `owner`/`manager` ka envite yon lòt itilizatè (email) — kreye yon
     paj `(dashboard)/settings/team` ki envwaye envitasyon Supabase Auth
     (`inviteUserByEmail`, sèvè-kote sèlman ak service role key) epi kreye
     yon `profiles` ki gen bon `store_id`/`role` lè envite a aksepte.

5. **Politik RLS pa wòl**
   - Ajoute migrasyon ki restriksyon ekriti sou `products`/`customers` bay
     `owner`/`manager` sèlman, pandan `cashier` ka toujou kreye
     `sales`/`sale_items`/`credit_payments`.

## Kritè pou konsidere etap la fini

- [ ] Yon nouvo itilizatè ka kreye yon boutik e konekte.
- [ ] Itilizatè ki pa konekte pa ka rive nan `(dashboard)/*`.
- [ ] `owner` ka envite yon `cashier`; `cashier` a ka konekte ak wòl kòrèk.
- [ ] Politik RLS anpeche yon `cashier` modifye `products` dirèkteman.

## Pwochen etap

Kontinye ak `03-products.md`.
