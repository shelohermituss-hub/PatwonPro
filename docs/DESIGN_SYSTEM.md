# Sistèm Design — Jere Boutik

Referans enplemantasyon pou UI/UX aplikasyon an. **`docs/CLAUDE.md`**
("Tokens visuels", "Règles UI") se sous verite pou desizyon pwodwi/design
— dosye sa a dekri kijan yo enplemante nan kòd la. Si yon ZIP design
system (Figma export) ajoute nan `design-system/`, li ranplase/konplete
detay enplemantasyon yo, pa règ yo.

## Objektif design

- **Tablèt-premye, peyizaj**: sib prensipal se yon tablèt Android 10 pous
  an mòd peyizaj, rezolisyon `1280 × 800` — pa telefòn. Layout dashboard
  la sèvi ak yon sidebar fiks (248px), pa yon tab bar anba.
- **POS fintech premium, senp pou itilize**: parèt modèn/pro, men rete
  fasil pou yon komèsan ki pa teknik — okenn mo teknik vizib, aksyon kle
  yo eksplisit ("Konfime vant lan", "Anile", "Anrejistre").
- **Kreyòl-premye**: tout tèks itilizatè-fasing an Kreyòl Ayisyen pa
  default.

## Tokens (enplemante nan `src/app/globals.css`)

| Rol | Chan CSS | Valè | Egzanp itilizasyon |
|---|---|---|---|
| Fon app | `--background` | `#F8FAFC` | Fon paj |
| Sifas/kat | `--surface` / `--card` | `#FFFFFF` | Kat, modal |
| Prensipal | `--primary` | `#2563EB` (ble) | Boutonn aksyon, lyen aktif sidebar |
| Prensipal hover | `--primary-hover` | `#1D4ED8` | Disponib kòm `--color-primary-hover` (Tailwind pa itilize l otomatikman — Button/varyant shadcn sèvi ak `hover:bg-primary/80` pa default) |
| Siksè | `--success` | `#16A34A` | Vant konplete, peman resevwa |
| Atansyon | `--warning` | `#F59E0B` | Alèt, badge stòk ba, sync annatant |
| Danje | `--danger` | `#DC2626` | Sipresyon, dèt an reta |
| Tèks prensipal | `--foreground` | `#0F172A` | |
| Tèks segondè | `--text-secondary` | `#64748B` | |
| Fwontyè | `--border` / `--input` | `#E2E8F0` | |
| Rayon mwayen | `--radius-md` (`rounded-md`) | `12px` | |
| Rayon gwo | `--radius-lg` (`rounded-lg`) | `16px` | |
| Lajè sidebar | `--sidebar-width` (`w-sidebar`) | `248px` | |
| Font | `--font-sans` | Plus Jakarta Sans | Chaje nan `src/app/layout.tsx` via `next/font/google` |

**⚠️ Atansyon `--accent`/`--accent-foreground`**: yo se tokens **NEYIT**
propriyete shadcn/ui pou ilimine eleman entèraktif (hover sou
`DropdownMenuItem`, `SelectItem`, elt.) — yo **PA** koulè "warning" a.
Pa janm repoint yo bay `#F59E0B`, sa ta fè chak hover meni vin oranj vif.
Koulè "warning" pwodwi a viv nan `--warning`/`--color-warning` separeman.

**⚠️ Chak `npx shadcn add`/`init` ka ekrase tokens sa yo** ak defo gri
preset la. Verifye `git diff src/app/globals.css` apre chak kòmand
shadcn epi restore valè tablo anwo a si sa rive (gen yon kòmantè nan tèt
`:root` nan fichye a ki make sa).

Mòd fonse jere pa klas `.dark` sou `<html>` (konvansyon shadcn), pa
`prefers-color-scheme` otomatik — pa gen bouton pou chanje mòd toujou;
ajoute yon "theme toggle" si mòd fonse dwe aksesib itilizatè.

## Konpozan (shadcn/ui)

`npx shadcn@latest init --defaults` deja kouri — Base UI (pa Radix),
preset Nova, `components.json` nan rasin pwojè a. Yon gwo seri konpozan
deja ajoute (`button`, `card`, `input`, `label`, `form`, `dialog`,
`sheet`, `dropdown-menu`, `select`, `tabs`, `table`, `badge`, `tooltip`,
`separator`, `avatar`, `command`, `popover`, `skeleton`, `alert-dialog`,
`calendar`, `switch`, `checkbox`, `scroll-area`, `progress`, `sonner`,
`textarea`, `input-group`) — gade `src/components/ui/`. Sèvi ak `npx
shadcn@latest add <component>` pou ajoute lòt, olye ekri markup HTML
brit — gade skill `shadcn` (`.claude/skills/shadcn`) pou règ konpozisyon.

Tout ikòn se **Lucide React** (`lucide-react`, deja enstale) — pa janm
emoji kòm ikòn entèfas.

## Konpozan kle

- **Boutonn gwo aksyon** (`Konfime vant lan`, `Ajoute nan panye`) — plen koulè `primary`, sib tach >= 48×48px.
- **Kat pwodwi** (grid POS) — imaj + non + pri, tap pou ajoute nan panye.
- **Badge estati** — `Peye` (vèt), `Kredi` (`warning`), `Anreta` (wouj).
- **Endikatè sync** — `SyncStatusBadge` (`src/components/SyncStatusBadge.tsx`), monte nan sidebar la, montre `Anliy · Tout bagay senkwonize` / `Ap senkwonize · N aksyon` / `Offline · N aksyon annatant`.
- **Sheet, pa modal, pou tach long**: `AlertDialog`/`Dialog` pou konfimasyon kout; `Sheet` (panno lateral) pou fòm/detay ki pran plis espas sou tablèt.
- Chak ekran done dwe gen 4 eta: loading, vid (empty), erè, ak offline.

## Layout

- **Sidebar tablèt fiks** (`(dashboard)/layout.tsx`): `w-sidebar` (248px),
  lojo + lis modil (Tablo Bò, Pwen Vant, Pwodwi, Antre Stòk, Kredi, Rapò,
  Abònman, Paramèt) chak ak yon ikòn Lucide, `SyncStatusBadge` anba l.
  Lyen aktif la make ak `bg-primary`.
- **`(admin)` separe**: wòl `platform_admin` pa gen `store_id`, donk li
  pa antre nan `(dashboard)` la (ki toujou sipoze yon boutik) — li gen
  pwòp seksyon (`(admin)/admin`) pou jesyon abònman/aparèy/sipò atravè
  tout boutik.

## Aksesibilite

- Kontras minimòm AA (WCAG) ant tèks ak fon.
- Tout ikòn aksyon dwe gen yon `aria-label` an Kreyòl.
- Navigasyon klavye ak eta `focus-visible` sou tout eleman entèraktif.

## `design-system/`

Lè yon ekspò Figma (tokens, konpozan, ikòn) disponib, dekonprese l nan `design-system/` epi:
1. Mete tokens koulè/tipografi yo nan blòk `@theme`/`:root` nan
   `src/app/globals.css` (Tailwind v4 — pa gen `tailwind.config.ts`).
2. Enpòte ikòn/asset SVG yo nan `src/components/icons/` (oswa itilize Lucide dirèkteman si ekspò a matche).
3. Aliyen dosye sa a ak `docs/CLAUDE.md` si vre valè yo diferan de pwen depa anwo a.
