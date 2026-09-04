# 01 — Enstalasyon ak konfigirasyon inisyal

## Objektif

Mete kanpe eskèlèt pwojè a: Next.js (TypeScript + Tailwind + App Router), koneksyon Supabase, baz Dexie lokal, ak estrikti dosye ki dekri nan `docs/ARCHITECTURE.md`.

## Sa pou fè

1. **Next.js**
   - `create-next-app` ak TypeScript, Tailwind, App Router, `src/` directory, ESLint, alias enpòte `@/*`.
   - Konfime `npm run dev` mache san erè.

2. **Estrikti dosye**
   - Kreye `src/app/(auth)/`, `src/app/(dashboard)/{dashboard,pos,products,stock-entries,credits,reports,subscription,settings}/`, `src/app/(admin)/admin/`.
   - Kreye `src/components/`, `src/lib/{supabase,db,sync,payments}/`, `src/hooks/`, `src/types/`.

3. **Varyab anviwònman**
   - Kreye `.env.local.example` ak:
     ```
     NEXT_PUBLIC_SUPABASE_URL=
     NEXT_PUBLIC_SUPABASE_ANON_KEY=
     SUPABASE_SERVICE_ROLE_KEY=
     MONCASH_CLIENT_ID=
     MONCASH_CLIENT_SECRET=
     NATCASH_CLIENT_ID=
     NATCASH_CLIENT_SECRET=
     ```
   - Ajoute `.env.local` nan `.gitignore` (`create-next-app` fè sa deja pa default).

4. **Depandans**
   - Enstale: `@supabase/supabase-js`, `@supabase/ssr`, `dexie`, `dexie-react-hooks`, `zod`, `clsx`.
   - Dev: `@types/node` (deja enkli), `prettier` si ekip la vle.

5. **Supabase**
   - Kreye `src/lib/supabase/client.ts` (kliyan browser) ak `src/lib/supabase/server.ts` (kliyan sèvè, sèvi ak `@supabase/ssr`).
   - Kreye premye migrasyon nan `supabase/migrations/` selon `docs/DATA_MODEL.md`.

6. **Dexie**
   - Kreye `src/lib/db/index.ts` ak schema Dexie pou `products`, `customers`, `sales`, `sale_items`, `credit_payments` (ak yon chan `sync_status`).

7. **Tailwind / Design tokens**
   - Aplike palèt koulè nan `docs/DESIGN_SYSTEM.md` nan `tailwind.config.ts` (`theme.extend.colors`).

8. **PWA de baz**
   - Ajoute `public/manifest.json` minimal (non, icon, koulè tèm) — konfigirasyon konplè fèt nan `08-pwa.md`.

## Kritè pou konsidere etap la fini

- [ ] `npm run build` reyisi san erè.
- [ ] `npm run lint` pase san erè.
- [ ] Estrikti dosye a matche `docs/ARCHITECTURE.md`.
- [ ] Kliyan Supabase (browser + sèvè) konfigire e li li varyab anviwònman kòrèkteman.
- [ ] Baz Dexie kreye ak tout tab yo defini.
- [ ] Premye migrasyon SQL egziste nan `supabase/migrations/` epi li matche `docs/DATA_MODEL.md`.

## Pwochen etap

Kontinye ak `02-auth.md` pou mete kanpe otantifikasyon ak jesyon wòl (owner/employee/platform_admin).
