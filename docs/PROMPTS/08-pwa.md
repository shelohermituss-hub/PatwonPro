# 08 — PWA konplè (offline, enstalasyon)

## Objektif

Fè Jere Boutik enstalab kòm yon app sou tablèt/òdinatè (sib prensipal:
tablèt Android 10 pous, peyizaj), ak yon service worker ki kenbe POS la
itilizab menm san entènèt ditou (premye chajman enkli).

## Depandans

Etap sa a se dènye a — li depann de tout lòt yo, sitou `04-pos.md`
(fonksyonalite offline deja egziste nan nivo done).

## Sa ki reyèlman konstwi (Phase 7)

### Service worker — manyèl, pa `next-pwa`

`next-pwa` (5.6.0, dènye vèsyon) itilize yon plugin webpack — li mete kòd
li nan `config.webpack()` nan `next.config.js`. Pwojè sa a bati ak
**Turbopack** (default depi Next.js 16, pa gen `--webpack` nan okenn
script `package.json`), e Turbopack pa rele hook `webpack()` a ditou.
Kidonk `next-pwa` pa t ap fè anyen si nou te enstale l — li t ap "reyisi"
san erè men service worker a pa t ap janm jenere. Nou verifye sa dirèkteman
(peer deps + kòman plugin an akwoche) anvan nou chwazi altènativ la doki
a te dejà otorize: "oswa ekri yon service worker manyèl senp".

- `public/sw.js` — pa gen okenn depandans (pa Workbox). Estrateji:
  - Navigasyon (paj HTML): **network-first**, kopi repons lan nan cache
    apre chak siksè, tonbe sou dènye vèsyon an cache (oswa `/`) si rezo a
    pa disponib ditou.
  - Asset `/​_next/static/*` (izole ak hash, immutable): **cache-first**.
  - Rès fichye estatik yo (manifest, icons, fonts): **stale-while-revalidate**.
  - `/api/*` ak nenpòt orijin ki pa menm domèn (Supabase, MonCash…):
    **pa janm** entèsepte — yo ale dirèkteman nan rezo a. Dexie
    (`src/lib/db/`) rete sèl sous verite pou done offline; service worker
    a jere sèlman App Shell/asset, jan doki a te mande.
  - Pa gen precache pou paj dashboard yo (`/sales/new`, `/products`,
    elatriye) — yo egzije yon sesyon otantifye, e yo ka redireksyone nan
    `/login` si `install` rive anvan itilizatè a konekte. Olye de sa,
    chak vizit lè w anliy ranpli/rafrechi cache a otomatikman (strateji
    "network-first" anwo a) — sa satisfè egzakteman senaryo tès doki a
    mande: "louvri app la online yon fwa" anvan w teste offline.
- `src/components/ServiceWorkerRegister.tsx` — anrejistre `/sw.js`,
  **pwodiksyon sèlman** (`NODE_ENV === "production"`). An dev, Turbopack
  chanje hash bundle yo apre chak edisyon; yon service worker k ap cache
  yo ta antre an konfli ak HMR olye ede.

### Icons

`public/icons/{icon-192,icon-512,apple-touch-icon}.png` — jenere ak
`sharp` (ki te deja yon depandans transitif nan `node_modules`, pa yon
nouvo depandans nan `package.json`) apati yon SVG senp (yon sak acha
blan sou fon ble prensipal la `#2563EB`, ki fè eko ak ikòn `ShoppingCart`
nan navigasyon an). Kontni an sitiye anndan zòn "maskable safe" (sèk 80%
santral la) — fon an ranpli tout kanva a pou vèsyon "maskable" Android la
pa gen okenn bòdi blan.

### Metadata

`src/app/layout.tsx` — ajoute `icons`, `appleWebApp`, ak yon `export const
viewport` separe (Next.js 16 depreke `metadata.themeColor`, li mande yon
egzò `viewport` apa — konfime nan `node_modules/next/dist/lib/metadata/types/`).

### Estati sync — elaji pou kouvri `credit_payments` ak `products`

`usePendingSyncCount.ts` te sèlman konte `sales`. Chanje an
`usePendingSyncSummary.ts` (`src/hooks/`) ki konte `sales`, `products`, ak
`creditPayments` ansanm — jan doki a te mande a eksplisitman pou
`credit_payments`. `SyncStatusBadge` kounye a se yon `Popover` (lè gen
> 0 aksyon annatan) ki montre yon dekonpozisyon pa tab — sa a se
"vizyalizasyon file datant sync" (#4 nan lis tach yo).

### Bouton enstalasyon

`src/components/InstallPrompt.tsx` — bannyè fen, ka fèmen, ki kapte
evènman `beforeinstallprompt` epi rele `.prompt()` sou klik. Chrome sèlman
voye evènman sa a lè tès enstalabilite pa l yo (manifest, service worker,
HTTPS) reyisi — pa gen anyen pou "fòse" pou navigatè ki pa janm voye l
(Safari iOS, oswa yon app ki deja enstale). Chwa itilizatè a (enstale/
fèmen) sove nan `localStorage` pou bannyè a pa parèt ankò chak sesyon.

### Konfli senkwonizasyon — deja jere, dokimante isit la

Motè sync ki te deja egziste depi Phase 3/4/5 (`src/lib/sync/{sales,
products,creditPayments}.ts`) suiv menm règ la pou chak tab: yon `pull`
**pa janm** ekrase yon ranje ki gen `sync_status: "pending"` lokalman —
modifikasyon lokal ki poko rive nan Supabase toujou gen priyorite sou
nenpòt lekti kap vini. Sa vle di: yon konfli reyèl sèlman ka rive lè
**menm ranje a modifye offline sou de aparèy diferan anvan tou de vin
anliy** — nan ka sa a, dènye `upsert` ki rive nan Supabase genyen (paske
`upsert` ekri sou `id` a, san konparezon). Sa a se yon "last-write-wins"
enplisit ki baze sou lè push la rive, pa yon konparezon eksplisit
`updated_at` kote de vèsyon ap konpare kot a kot — nou pa t ajoute yon
konparezon konsa paske pa gen okenn senaryo kote de aparèy ta modifye
menm pwodwi a **anba menm boutik la** an menm tan san youn nan yo pa
anliy pou lòt la wè chanjman an dabò (yon sèl tablèt pa boutik nan modèl
sa a). Si sa ta chanje pita, `updated_at` deja egziste sou chak tab pou
ajoute yon konparezon eksplisit san migrasyon.

## Kritè pou konsidere etap la fini

- [x] Manifest + icons + service worker + bouton enstalasyon konstwi.
- [x] Estati sync kouvri `sales`, `products`, ak `credit_payments`.
- [ ] Lighthouse PWA audit — poko fèt kont yon deplwaman reyèl (HTTPS
      pwodiksyon mande pou verifye enstalabilite a nèt).
- [x] **Service worker verifye kont yon vrè `next start` (pwodiksyon)**:
      anrejistreman konfime (`navigator.serviceWorker.controller`), de
      cache yo kreye (`jere-boutik-v1-shell`, `-assets`), e yon reload
      `/login` apre `context.setOffline(true)` chaje paj la nèt (fòm
      konekte a vizib) san erè navigatè — kapti nan
      `sw-01-offline-login.png`.
- [x] **Ekriti Dexie offline verifye ak Playwright, dev mode**: yon vant
      kach (`checkoutSale`) ak yon nouvo pwodwi (`ProductForm`) toude
      ekri kòrèkteman ak `sync_status: "pending"` pandan
      `context.setOffline(true)`, e `SyncStatusBadge`/popover li montre
      dekonpozisyon kòrèk la (`Vant 1, Pwodwi 1`) — kapti nan
      `off-01-after-checkout.png` ak `off-02-sync-popover.png`.
  - **Twouve nan pasaj la, pa yon bug kòd aplikasyon an**: lè
    `ProductForm` fè `router.push("/products")` apre yon anrejistreman
    ki reyisi pandan offline, fetch RSC Next.js la echwe e li "tonbe" sou
    yon navigasyon navigatè konplè (`chrome-error://` — mesaj egzat:
    "Falling back to browser navigation"). Sa a rive **sèlman an dev**
    paske service worker a pa anrejistre la (pa gen anyen pou rate
    navigasyon an). An pwodiksyon, menm fetch/navigasyon sa a ta pase
    nan `fetch` handler service worker a (branch "navigate" `sw.js`), ki
    ta tonbe sou dènye vèsyon cache a olye yon erè navigatè — done Dexie
    a toujou ekri anvan `router.push` rele, kidonk pa gen okenn done pèdi
    nan de ka yo.
- [ ] Push reyèl kont Supabase apre rekonesyon rezo — **eseye men pa
      konfime konplete**: apre `context.setOffline(false)`, tann 22 segonn
      (pi lontan pase `BACKGROUND_INTERVAL_MS` 20s la), `sync_attempts`
      rete `0` — pwoksi anviwònman sa a pa echwe rapid sou apèl Supabase
      yo (`ws_closed_mid_exchange`/`ERR_CONNECTION_RESET`, menm limit ki
      dokimante nan `07-payments.md`), li rete "pandye" olye retounen yon
      erè klè, kidonk `syncPendingSales()` pa janm rive nan branch
      `catch`/`error` li pou enkremante `sync_attempts` nan fenèt tès la.
      Done a rete `pending` (kòrèk — pa gen echèk fo, pa gen kras) men
      yon sik retry konplè mande yon sesyon otantifye vivan pou verifye.

## Apre sa

Pwojè a gen tout fonksyonalite debaz li. Pwochèn priyorite posib (pa nan
seri sa a): rapò avanse (grafik), sipò milti-boutik pou yon sèl pwopriyetè,
notifikasyon SMS/WhatsApp pou dèt an reta.
