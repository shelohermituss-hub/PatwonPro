# Achitekti — Jere Boutik Pro

## Apèsi

Jere Boutik Pro se yon PWA (Progressive Web App) pou ede ti boutik ak mwayen boutik an Ayiti jere:
- Envantè / pwodwi
- Vant nan pwen vant (POS)
- Kredi kliyan (vant a kredi, "fè kredi")
- Rapò vant ak envantè
- Peman (kach, MonCash, NatCash)

Aplikasyon an fèt pou mache **offline-first**: yon boutik ka pa gen entènèt tout tan, donk POS la dwe fonksyone san koneksyon epi senkronize done yo lè koneksyon an retabli.

## Estak teknik

| Kouch | Teknoloji |
|---|---|
| Fwontyè (UI) | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Estokaj lokal / offline | Dexie.js (IndexedDB wrapper) |
| Backend / DB | Supabase (Postgres + Auth + Row Level Security + Storage) |
| Peman | Entegrasyon API MonCash (Digicel) ak NatCash (Natcom) |
| PWA | Service worker + manifest, enstalasyon sou telefòn/òdinatè |
| Deplwaman | Vercel (fwontyè) + Supabase Cloud (backend) |

## Prensip achitekti

1. **Offline-first** — tout ekran POS ak lekti pwodwi dwe travay san entènèt. Dexie se sous verite lokal la; Supabase se sous verite a long tèm.
2. **Sync ki idanpotan (idempotent)** — chak vant kreye lokalman gen yon UUID kliyan-jenere pou evite double-anrejistreman lè l' senkronize.
3. **Multi-tenant** — chak boutik se yon `store` separe ak Row Level Security sou Supabase pou izole done ant boutik.
4. **Wòl itilizatè** — Pwopriyetè (owner), Jerans (manager), Kesye (cashier) — chak gen dwa diferan.
5. **Mobil-premye (mobile-first)** — pifò itilizatè yo ap sou telefòn Android antre gam, donk UI a dwe rapid, senp, e limye sou done.

## Estrikti dosye

```
src/
├── app/                 # Next.js App Router (paj + API routes)
│   ├── (auth)/          # Login / enskripsyon
│   ├── (dashboard)/     # Aplikasyon prensipal apre koneksyon
│   │   ├── pos/         # Ekran vant
│   │   ├── products/    # Jesyon pwodwi
│   │   ├── credits/     # Jesyon kredi kliyan
│   │   └── reports/     # Rapò
│   └── api/             # Route handlers (webhooks peman, elt.)
├── components/          # Konpozan reyitilizab (UI)
├── lib/
│   ├── supabase/        # Kliyan Supabase (browser + server)
│   ├── db/              # Baz Dexie (schema, hooks)
│   ├── sync/            # Motè senkronizasyon offline <-> Supabase
│   └── payments/        # Entegrasyon MonCash / NatCash
├── hooks/                # React hooks (useCart, useOfflineSync, elt.)
└── types/                # Definisyon TypeScript pataje
supabase/
└── migrations/           # Migrasyon SQL (schema + RLS policies)
docs/
├── ARCHITECTURE.md        # Dokiman sa a
├── DESIGN_SYSTEM.md        # Sistèm design / UI
├── DATA_MODEL.md           # Modèl done / schema
└── PROMPTS/                 # Seri pwonpt pou bati chak fonksyonalite etap pa etap
design-system/               # Asset design (Figma export, tokens, elt.)
```

## Flux senkronizasyon offline

1. Kesye a fè yon vant → li anrejistre nan Dexie (IndexedDB) ak yon `sync_status = "pending"`.
2. Yon `sync worker` (background, deklanche pa `online` event oswa yon entèval) voye vant "pending" yo bay Supabase.
3. Si sync la reyisi → `sync_status = "synced"`. Si l echwe → li rete "pending" e eseye ankò.
4. Konfli yo rezoud ak "last-write-wins" sou nivo chan, sof pou kantite stòk ki itilize yon operasyon atomik (`decrement`) kote posib.

## Sekirite

- Supabase Row Level Security (RLS) sou tout tab ki gen `store_id` — yon itilizatè ka wè sèlman done boutik pa li.
- Kle sekrè API peman (MonCash/NatCash) rete sèvè-kote sèlman (Next.js route handlers / Supabase Edge Functions), pa janm ekspoze nan fwontyè a.
- Sesyon Auth jere pa Supabase Auth (JWT), ak refresh token pou sipòte itilizasyon long tèm san koneksyon.
