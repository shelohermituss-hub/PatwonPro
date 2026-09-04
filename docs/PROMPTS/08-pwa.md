# 08 — PWA konplè (offline, enstalasyon)

## Objektif

Fè Jere Boutik enstalab kòm yon app sou tablèt/òdinatè (sib prensipal:
tablèt Android 10 pous, peyizaj), ak yon service worker ki kenbe POS la
itilizab menm san entènèt ditou (premye chajman enkli).

## Depandans

Etap sa a se dènye a — li depann de tout lòt yo, sitou `04-pos.md`
(fonksyonalite offline deja egziste nan nivo done).

## Sa pou fè

1. **Icons**
   - Jenere `public/icons/icon-192.png` ak `icon-512.png` (ak vèsyon
     "maskable") ki referanse deja nan `public/manifest.json`.

2. **Service worker**
   - Ajoute `next-pwa` (oswa ekri yon service worker manyèl senp) ki:
     - Cache assets estatik yo (JS/CSS/font) — estrateji "stale-while-
       revalidate" oswa "cache-first".
     - Cache paj App Shell la (`/dashboard`, `/pos`, `/products`,
       `/stock-entries`, `/credits`, `/reports`, `/subscription`,
       `/settings`) pou yo louvri menm si rezo a pa disponib ditou.
     - PA cache repons API ki gen done sansib san estrateji klè (pito kite
       Dexie jere pèsistans done, service worker jere sèlman asset/shell).

3. **Estati koneksyon global** — deja fèt (`src/hooks/useOnlineStatus.ts`,
   `src/hooks/usePendingSyncCount.ts`, `src/components/SyncStatusBadge.tsx`,
   monte nan sidebar `(dashboard)/layout.tsx`). Pa rekreye l; elaji l pou
   kouvri `credit_payments` si etap `05-credits.md` ajoute yon sync pou tab
   sa a tou.

4. **Enstalasyon**
   - Bouton/bannyè "Enstale Jere Boutik sou aparèy ou" ki itilize evènman
     `beforeinstallprompt`.

5. **Tès offline konplè**
   - Senaryo tès: louvri app la online yon fwa (pou premye chajman/cache),
     mete telefòn nan mòd avyon, epi:
     - Navige ant POS/Pwodwi/Kredi/Rapò san erè blan (rapò yo ka montre yon
       mesaj "Rapò mande koneksyon" olye kraze, paske yo li Supabase
       dirèkteman).
     - Fè yon vant konplè, wè li parèt "pending" nan endikatè sync la.
     - Retabli rezo a, konfime vant lan sync epi vin "synced".

## Kritè pou konsidere etap la fini

- [ ] App la ka enstale sou Android/desktop Chrome.
- [ ] Lighthouse PWA audit pase (installable, service worker registered).
- [ ] Senaryo tès offline konplè anwo a reyisi san erè.

## Apre sa

Pwojè a gen tout fonksyonalite debaz li. Pwochèn priyorite posib (pa nan
seri sa a): rapò avanse (grafik), sipò milti-boutik pou yon sèl pwopriyetè,
notifikasyon SMS/WhatsApp pou dèt an reta.
