# Sistèm Design — Jere Boutik Pro

Referans rapid pou UI/UX aplikasyon an. Si yon ZIP design system (Figma export, tokens) ajoute nan `design-system/`, li ranplase/konplete gid sa a — dosye sa a se pwen depa a.

## Objektif design

- **Rapid sou telefòn antre gam** — pifò kesye yo sou Android bon mache, koneksyon fèb. UI dwe leje (peu de JS, imaj optimize).
- **Klè anba presyon** — kesye a ka sèvi anpil kliyan youn apre lòt; boutonn gwo, kontras fò, mwens etap posib pou fini yon vant.
- **Bileng Kreyòl-premye** — tout tèks entèfas an Kreyòl Ayisyen pa default, ak posiblite tradiksyon Fransè/Anglè pita (i18n-ready).

## Palèt koulè (pwen depa — ranplase ak tokens design-system/ si genyen)

| Rol | Koulè | Egzanp itilizasyon |
|---|---|---|
| Prensipal (`primary`) | `#0F766E` (tiyal fonse) | Boutonn aksyon, header |
| Aksan (`accent`) | `#F59E0B` (oranj) | Alèt, badge stòk ba |
| Siksè (`success`) | `#16A34A` | Vant konplete, peman resevwa |
| Danje (`danger`) | `#DC2626` | Sipresyon, dèt an reta |
| Fon (`background`) | `#F8FAFC` | Fon paj |
| Sifas (`surface`) | `#FFFFFF` | Kat, modal |
| Tèks prensipal | `#0F172A` | |
| Tèks segondè | `#64748B` | |

## Tipografi

- Fonn sistèm (`Inter` oswa `system-ui`) pou pèfòmans sou aparèy fèb.
- Echèl: `text-xs` (12) → `text-3xl` (30) selon konvansyon Tailwind default.
- Boutonn ak chan fòm dwe gen omwen `44px` wotè pou touch-target sou mobil.

## Konpozan kle

- **Boutonn gwo aksyon** (`Peye`, `Ajoute nan panye`) — plen koulè `primary`, wotè >= 48px.
- **Kat pwodwi** (grid POS) — imaj + non + pri, tap pou ajoute nan panye.
- **Badge estati** — `Peye` (vèt), `Kredi` (oranj), `Anreta` (wouj).
- **Endikatè sync** — yon ti pwen/icon nan header ki montre `sync` (vèt), `pending` (gri), `offline` (wouj) — enpòtan paske aplikasyon an offline-first.
- **Modal konfimasyon** — pou aksyon destriktif (efase pwodwi, anile vant).

## Layout

- **Mobil-premye**: 1 kolòn pou fòm, grid 2-3 kolòn pou lis pwodwi POS.
- **Navigasyon** — tab bar anba sou mobil (`POS`, `Pwodwi`, `Kredi`, `Rapò`), sidebar sou desktop/tablet.

## Aksesibilite

- Kontras minimòm AA (WCAG) ant tèks ak fon.
- Tout ikòn aksyon dwe gen yon `aria-label` an Kreyòl.
- Sipòte gwosè tèks navigatè a ogmante san kase layout.

## `design-system/`

Lè yon ekspò Figma (tokens, konpozan, ikòn) disponib, dekonprese l nan `design-system/` epi:
1. Mete tokens koulè/tipografi yo nan `tailwind.config.ts` (`theme.extend`).
2. Enpòte ikòn/asset SVG yo nan `src/components/icons/`.
3. Aliyen dosye sa a ak vre valè yo si yo diferan de pwen depa anwo a.
