# Gid pou Claude — Jere Boutik Pro

Dokiman sa a bay Claude (oswa nenpòt asistan IA) kontèks pou travay sou pwojè a. Li li ansanm ak `ARCHITECTURE.md`, `DATA_MODEL.md`, `DESIGN_SYSTEM.md`, ak `PROMPTS/`.

## Kisa pwojè a ye

**Jere Boutik Pro** se yon PWA pou ti boutik ak mwayen boutik an Ayiti jere envantè yo, fè vant (POS), swiv kredi kliyan, ak wè rapò — menm san entènèt.

## Lang

- Tout kontni itilizatè-fasing (UI, mesaj erè, non chan) an **Kreyòl Ayisyen**.
- Kòd (non varyab, fonksyon, tab, kòmantè kòd) an **Anglè**, konvansyon estanda endistri a.
- Dokiman entèn (`docs/`) an Kreyòl, pou ekip lokal la ka kontribye fasil.

## Fason pou travay sou pwojè a

1. **Swiv `PROMPTS/`** — chak dosye (`01-setup.md` → `08-pwa.md`) reprezante yon etap bati aplikasyon an. Fè yo nan lòd, chak youn depann sou sa ki anvan an.
2. **Respekte `ARCHITECTURE.md`** pou estrikti dosye ak flux offline-sync.
3. **Respekte `DATA_MODEL.md`** pou non tab/chan lè w ap ekri migrasyon SQL oswa tip TypeScript.
4. **Respekte `DESIGN_SYSTEM.md`** pou koulè, konpozan, ak layout — sof si `design-system/` gen yon vèsyon plis presi (Figma export).

## Règ jeneral

- Pa janm ekspoze kle sekrè (Supabase service role, kle API MonCash/NatCash) nan kòd fwontyè oswa nan repo a — sèvi ak varyab anviwònman (`.env.local`, sekrè Vercel/Supabase).
- Tout tab Supabase ki gen `store_id` DWE gen yon politik RLS anvan yo itilize an pwodiksyon.
- Nenpòt fonksyonalite POS dwe teste nan mòd offline (koupe rezo, verifye done yo rete disponib e yo senkronize apre).
- Sèvi ak `numeric(12,2)` pou tout kolòn lajan; pa janm itilize `float`.
- Kòmantè kòd sèlman lè yon rezon ki pa evidan bezwen eksplike (yon workaround, yon kontrent API peman, elt.) — pa dekri sa kòd la fè deja klèman.

## Kòmand itil

```bash
npm run dev        # Sèvè devlopman lokal
npm run build       # Build pwodiksyon
npm run lint         # ESLint
npx supabase db push # Aplike migrasyon sou pwojè Supabase ki konfigire a
```

## Pwochen etap

Gade `docs/PROMPTS/01-setup.md` pou detay konfigirasyon inisyal, epi kontinye ak `02-auth.md`, `03-products.md`, elatriye.
