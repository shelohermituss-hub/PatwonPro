# 07 — Entegrasyon MonCash & NatCash

## Objektif

Konekte flux POS la ak API peman mobil MonCash (Digicel) ak NatCash (Natcom)
pou vant peye ak telefòn kliyan an, olye kach sèlman.

## Depandans

Etap sa a depann de `04-pos.md` (POS la deja gen `payment_method` kòm chwa).

## Sa ki reyèlman konstwi (Phase 6)

**Rechèch te fèt anvan kòd la**: pa gen "MonCashConnect SDK" ni "NatCash
SDK" ki egziste kòm pakè npm — verifye dirèkteman kont registre npm la. Pou
MonCash, dokiman ofisyèl Digicel yo **egziste toujou** (PDF sou
`sandbox.moncashbutton.digicelgroup.com/Moncash-business/resources/doc/`,
kontrèman ak sa yon vèsyon anvan te note kòm 404) — nou li yo dirèkteman e
verifye chak chan/wout kont yo. Pou NatCash, **pa gen okenn dokiman piblik
ki egziste** — sa a pa chanje ant vèsyon dokiman sa a.

### MonCash — reyèlman verifye, poko teste kont yon sandbox vivan

1. `src/lib/payments/moncash.ts` — chan/wout yo (`CreatePayment`,
   `RetrieveOrderPayment`, `RetrieveTransactionPayment`, OAuth) verifye
   kont PDF ofisyèl Digicel a. Yon erè te jwenn e korije: `rawStatus`
   te pran chan `status` (yon senp eko kòd HTTP, toujou 200 si apèl la
   reyisi) olye `payment.message` (vrè siyal siksè a, valè konfime a se
   `"successful"`) — `mapMonCashStatus()` kounye a itilize bon chan an.
2. **Pa gen webhook/IPN nan dokiman MonCash yo** — table of contents PDF
   la pa gen okenn seksyon konsa, sèl mekanis yo dokimante se yon
   redireksyon + verifikasyon sèvè-kote apre. Kidonk **"poll" se mekanis
   prensipal konfimasyon an**, pa yon fallback:
   - `POST /api/moncash/create-payment` — kreye yon `payment_transactions`
     (status `pending`, `id` la sèvi kòm MonCash `orderId`), rele
     `createMonCashPayment`, retounen yon URL redireksyon.
   - `GET /api/moncash/status/[id]` — "poll" chak 4 segonn
     (`useMonCashPayment.ts`) — verifye kont MonCash si toujou `pending`,
     mete `payment_transactions` ajou si konfime.
   - `POST /api/moncash/status/[id]` — `{action: "cancel"}` (kesye a
     anile) oswa `{action: "link-sale", saleId}` (mare tranzaksyon an ak
     vant lan yon fwa Dexie kreye l).
   - `POST /api/webhooks/moncash` — **konstwi paske sa te mande, men gen
     gwo chans li pa janm resevwa trafik reyèl** — gade kòmantè nan
     fichye a. Siyati verifye ak yon HMAC pwòp nou defini
     (`MONCASH_WEBHOOK_SECRET`), pa yon mekanis MonCash konfime.
3. **Flux nan POS** (`(dashboard)/sales/new`, `CartPanel.tsx`) — chwazi
   `moncash` louvri `MonCashPaymentDialog` (kòd QR ki kode URL
   redireksyon an, pou kliyan an eskane ak pwòp telefòn li san POS la pa
   kite paj la). Vant lan (`checkoutSale`, Dexie) sèlman kreye **apre**
   konfimasyon — pa gen "vant pandan" nan Dexie.
4. **Poko teste kont yon sandbox vivan** — okenn kredansyèl pa t
   disponib pandan Phase 6. Verifye `MONCASH_CLIENT_ID`/`SECRET` nan yon
   kont sandbox reyèl anvan pwodiksyon.

### NatCash — rete yon plasholder, pa nan flux POS la

- `src/lib/payments/natcash.ts` rete yon plasholder ke pa verifye (menm
  jan ak anvan). `POST /api/natcash/create-payment` ak
  `POST /api/webhooks/natcash` konstwi ak menm fòm ak MonCash, men **pa
  rele pa POS la** — `CartPanel.tsx` montre "NatCash pa disponib pou
  kounye a" lè l chwazi, e anpeche konplete vant lan ak mwayen sa a.
  Rezon: prezante yon flux k ap "sanble mache" ki baze sou chan devine
  ta ka twonpe yon kesye ki panse yon kliyan fin peye. Yon fwa gen vrè
  dokiman machann NatCash, wout ak kliyan yo pare pou aktive.

## Kritè pou konsidere etap la fini

- [ ] Yon vant tès ka peye ak MonCash sandbox e `payment_status` vin `paid`
      (kòd la pare, men **poko teste kont yon vrè sandbox**).
- [x] MonCash: chan/wout verifye kont dokiman ofisyèl.
- [ ] NatCash: rete an atant vrè dokiman machann — pa yon objektif Phase 6.
- [x] Webhook yo verifye siyati anvan yo modifye done (HMAC pwòp nou
      defini, pa yon mekanis founisè konfime).

## Pwochen etap

Kontinye ak `08-pwa.md`.
