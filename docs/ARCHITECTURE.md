# Achitekti — PatwonPro

## Apèsi

PatwonPro se yon PWA (Progressive Web App) premium pou ede ti boutik ak mwayen boutik an Ayiti jere:
- Envantè / pwodwi, antre stòk ak ajisteman
- Vant nan pwen vant (POS)
- Kredi kliyan (vant a kredi, "fè kredi")
- Rapò vant ak envantè
- Peman (kach, MonCash, NatCash)
- Abònman, tablèt (aparèy), ak sipò — jere pa ekip PatwonPro la

Aplikasyon an fèt pou mache **offline-first**: yon boutik ka pa gen entènèt tout tan, donk POS la dwe fonksyone san koneksyon epi senkronize done yo lè koneksyon an retabli. Sib prensipal la se yon **tablèt Android 10 pous an mòd peyizaj** (1280×800) — gade `docs/CLAUDE.md` pou detay pwodwi/design konplè.

## Estak teknik

| Kouch | Teknoloji |
|---|---|
| Fwontyè (UI) | Next.js (App Router) + TypeScript strict + Tailwind CSS + shadcn/ui + Lucide React |
| Fòm | React Hook Form + Zod |
| Grafik | Recharts |
| Estokaj lokal / offline | Dexie.js (IndexedDB wrapper) |
| Backend / DB | Supabase (Postgres + Auth + Row Level Security + Storage) |
| Peman | Entegrasyon API MonCash (Digicel) ak NatCash (Natcom) |
| PWA | Service worker + manifest, enstalasyon sou tablèt/òdinatè |
| Deplwaman | Vercel (fwontyè) + Supabase Cloud (backend) |

## Prensip achitekti

1. **Offline-first** — tout ekran POS ak lekti pwodwi dwe travay san entènèt. Dexie se sous verite lokal la; Supabase se sous verite a long tèm.
2. **Sync ki idanpotan (idempotent)** — chak vant kreye lokalman gen yon UUID kliyan-jenere pou evite double-anrejistreman lè l' senkronize.
3. **Multi-tenant** — chak boutik se yon `store` separe ak Row Level Security sou Supabase pou izole done ant boutik.
4. **Wòl itilizatè** — `owner` (pwopriyetè, aksè total sou pwòp boutik), `employee` (anplwaye, limite a vant/kredi), `platform_admin` (ekip PatwonPro, jere abònman/tablèt/sipò/kont atravè **tout** boutik — pa gen `store_id`).
5. **Tablèt-premye, peyizaj** — sib prensipal se yon tablèt Android 10 pous an mòd peyizaj (1280×800); UI a dwe rapid, klè, e santre sou aksyon/chif enpòtan.

## Estrikti dosye

```
src/
├── app/                     # Next.js App Router (paj + API routes)
│   ├── (auth)/              # Login / enskripsyon
│   ├── (dashboard)/         # Aplikasyon prensipal pou owner/employee (yon sèl boutik)
│   │   ├── dashboard/       # Tablo Bò
│   │   ├── pos/             # Pwen Vant
│   │   ├── products/        # Jesyon pwodwi
│   │   ├── stock-entries/   # Antre stòk ak ajisteman
│   │   ├── credits/         # Jesyon kredi kliyan
│   │   ├── reports/         # Rapò
│   │   ├── subscription/    # Vi abònman/tablèt/sipò boutik la
│   │   └── settings/        # Paramèt boutik ak anplwaye
│   ├── (admin)/              # Konsòl `platform_admin` sèlman (atravè tout boutik)
│   │   └── admin/
│   └── api/                  # Route handlers (webhooks peman, elt.)
├── components/
│   └── ui/                   # Konpozan shadcn/ui
├── lib/
│   ├── supabase/              # Kliyan Supabase (browser + server + admin/service-role)
│   ├── db/                    # Baz Dexie (schema, hooks)
│   ├── sync/                  # Motè senkronizasyon offline <-> Supabase
│   └── payments/               # Entegrasyon MonCash / NatCash
├── hooks/                       # React hooks (useOnlineStatus, usePendingSyncCount, elt.)
└── types/                        # Definisyon TypeScript pataje
supabase/
└── migrations/                   # Migrasyon SQL (schema + RLS policies)
docs/
├── CLAUDE.md                      # Enstriksyon pwojè — sous verite pwodwi/design
├── ARCHITECTURE.md                 # Dokiman sa a
├── DESIGN_SYSTEM.md                 # Detay enplemantasyon design/tokens
├── DATA_MODEL.md                     # Modèl done / schema
└── PROMPTS/                           # Seri pwonpt pou bati chak fonksyonalite etap pa etap
design-system/                         # Asset design (Figma export, tokens, elt.)
```

## Flux senkronizasyon offline

1. Yon anplwaye fè yon vant → li anrejistre nan Dexie (IndexedDB) ak yon `sync_status = "pending"`.
2. Yon `sync worker` (background, deklanche pa `online` event + yon boukle entèval, ak backoff eksponansyèl si eseye a echwe) voye vant "pending" yo bay Supabase.
3. Si sync la reyisi → `sync_status = "synced"`. Si l echwe → li rete "pending" e eseye ankò apre yon delè k ap monte.
4. Konfli yo rezoud ak "last-write-wins" sou nivo chan, sof pou kantite stòk ki itilize yon operasyon atomik (`decrement`) kote posib.
5. `SyncStatusBadge` montre eta a an tan reyèl (`Anliy`/`Ap senkwonize`/`Offline`) — monte nan sidebar `(dashboard)/layout.tsx`.

## Sekirite

- Supabase Row Level Security (RLS) sou tout tab ki gen `store_id` — yon itilizatè ka wè sèlman done boutik pa li, sof `platform_admin` ki gen aksè global (fonksyon `is_platform_admin()`, gade migrasyon inisyal la).
- Kle sekrè API peman (MonCash/NatCash) ak `SUPABASE_SERVICE_ROLE_KEY` rete sèvè-kote sèlman (Next.js route handlers, kliyan admin nan `src/lib/supabase/admin.ts`), pa janm ekspoze nan fwontyè a.
- Sesyon Auth jere pa Supabase Auth (JWT), ak refresh token pou sipòte itilizasyon long tèm san koneksyon.
- **Peman**: pa janm mete yon vant `paid` sou baz repons frontend/redireksyon sèlman — konfimasyon dwe soti nan yon webhook siyati verifye sèvè-kote (gade `docs/PROMPTS/07-payments.md`).
