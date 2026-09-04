# 02 — Otantifikasyon ak wòl itilizatè

## Objektif

Pèmèt yon pwopriyetè boutik kreye kont, konekte, kreye boutik li, epi envite
anplwaye. Aplike wòl (`owner`/`employee`/`platform_admin`) atravè tout
aplikasyon an, ak redireksyon ki kòrèk pou chak wòl.

## Depandans

Etap sa a depann de `01-setup.md` (kliyan Supabase, migrasyon inisyal).

## Sa pou fè

1. **Enskripsyon pwopriyetè**
   - Paj `(auth)/register` — kreye kont Supabase Auth (email + modpas), epi
     kreye yon ranje `stores` ak yon ranje `profiles` (`role = "owner"`) nan
     yon sèl transaksyon (sèvi ak yon Postgres function/RPC pou atomicite).

2. **Koneksyon**
   - Ranpli `(auth)/login/page.tsx` ak yon fòm ki sèvi ak
     `supabase.auth.signInWithPassword` (React Hook Form + Zod, `FieldGroup`/
     `Field` per règ shadcn — gade `.claude/skills/shadcn`).
   - Redireksyon apre siksè selon wòl: `platform_admin` → `/admin`,
     `owner`/`employee` → `/dashboard`.

3. **Pwoteksyon wout**
   - `src/proxy.ts` (deja egziste — **pa** `middleware.ts`, gade
     `AGENTS.md`) dwe redirije itilizatè ki pa konekte yo bay `/login` lè
     yo eseye rive nan `(dashboard)/*` oswa `(admin)/*`.
   - `(admin)/*` an plis dwe verifye `role === "platform_admin"` (yon
     `owner`/`employee` ki eseye rive la dwe redirije bay `/dashboard`, pa
     jwenn yon erè 500/blanch).
   - Kreye yon `getCurrentProfile()` helper (`src/lib/supabase/`) ki li
     `profiles` pou itilizatè aktyèl la, itilize l nan `(dashboard)/layout.tsx`
     ak `(admin)/layout.tsx` pou afiche non/wòl epi fè verifikasyon aksè a.

4. **Envitasyon ekip**
   - Yon `owner` ka envite yon `employee` (email) — kreye yon paj
     `(dashboard)/settings` (deja gen yon placeholder) ki envwaye envitasyon
     Supabase Auth (`inviteUserByEmail`, sèvè-kote sèlman ak
     `src/lib/supabase/admin.ts`) epi kreye yon `profiles` ki gen bon
     `store_id`/`role` lè envite a aksepte.
   - Envitasyon `platform_admin` pa fèt pa yon `owner` — se yon aksyon
     entèn ekip Jere Boutik la (pa nan pòte etap sa a).

5. **Politik RLS pa wòl**
   - Ajoute migrasyon ki restriksyon ekriti sou `products`/`customers` bay
     `owner` sèlman, pandan `employee` ka toujou kreye
     `sales`/`sale_items`/`credit_payments`.

## Kritè pou konsidere etap la fini

- [ ] Yon nouvo itilizatè ka kreye yon boutik e konekte.
- [ ] Itilizatè ki pa konekte pa ka rive nan `(dashboard)/*` ni `(admin)/*`.
- [ ] `owner` ka envite yon `employee`; `employee` a ka konekte ak wòl kòrèk
      epi redirije bay `/dashboard` (pa `/admin`).
- [ ] Yon `owner`/`employee` ki eseye rive nan `/admin` redirije bay
      `/dashboard`.
- [ ] Politik RLS anpeche yon `employee` modifye `products` dirèkteman.

## Pwochen etap

Kontinye ak `03-products.md`.
