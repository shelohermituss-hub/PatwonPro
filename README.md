# PatwonPro

PWA pou ede ti boutik ak mwayen boutik an Ayiti jere envantè, vant (pwen
vant), kredi kliyan, ak rapò — menm san entènèt.

## Estak

Next.js (App Router) + TypeScript + Tailwind CSS · Dexie (offline-first) ·
Supabase (Postgres, Auth, RLS) · MonCash & NatCash (peman mobil).

## Kòmanse

```bash
cp .env.local.example .env.local   # ranpli kle Supabase/MonCash/NatCash yo
npm install
npm run dev
```

Louvri [http://localhost:3000](http://localhost:3000).

## Dokimantasyon

- [`docs/CLAUDE.md`](docs/CLAUDE.md) — pwen depa: kontèks pwojè a pou
  travay ladan l ak yon asistan IA.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — estrikti dosye, flux
  senkronizasyon offline.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — schema Supabase.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — palèt, tipografi,
  konpozan.
- [`docs/PROMPTS/`](docs/PROMPTS) — seri pwonpt (`01-setup` → `08-pwa`)
  pou bati chak fonksyonalite etap pa etap.

## Kòmand

```bash
npm run dev     # sèvè devlopman
npm run build    # build pwodiksyon
npm run lint      # ESLint
```
