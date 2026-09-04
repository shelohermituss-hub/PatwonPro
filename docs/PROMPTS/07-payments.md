# 07 — Entegrasyon MonCash & NatCash

## Objektif

Konekte flux POS la ak API peman mobil MonCash (Digicel) ak NatCash (Natcom)
pou vant peye ak telefòn kliyan an, olye kach sèlman.

## Depandans

Etap sa a depann de `04-pos.md` (POS la deja gen `payment_method` kòm chwa).

## Sa pou fè

1. **Konfigirasyon**
   - Ranpli `MONCASH_CLIENT_ID/SECRET` ak `NATCASH_CLIENT_ID/SECRET` nan
     `.env.local` (soti nan pòtal machann chak founisè).
   - `src/lib/payments/moncash.ts` deja konplè (`createMonCashPayment`,
     `getMonCashPaymentStatus`), vre-verifye kont yon SDK piblik paske sit
     dokiman MonCash a te retounen 404. **Verifye kont sandbox lan** anvan
     pwodiksyon — mapin `rawStatus` → `paid`/`failed` poko fèt (chan sa a
     brit entansyonèlman, gade kòmantè nan fichye a).
   - `src/lib/payments/natcash.ts` rete yon **plasholder ke pa verifye**
     (pa gen dokiman piblik NatCash) — mete ajou non chan/wout yo kont
     dokiman machann reyèl la anvan w konte sou li.
   - `src/lib/supabase/admin.ts` (kliyan service-role) ak
     `src/lib/payments/audit.ts` (`recordPaymentTransaction`,
     `updatePaymentTransactionStatus`) deja egziste — sèvi ak yo pito
     pase ekri SQL dirèk nan route handlers yo.

2. **Route handlers**
   - `src/app/api/payments/moncash/route.ts` — rele
     `createMonCashPayment`, epi `recordPaymentTransaction` (`status:
     "pending"`) anvan retounen URL redireksyon an bay fwontyè a.
   - `src/app/api/payments/moncash/webhook/route.ts` — resevwa notifikasyon
     MonCash, verifye siyati/otantisite (**pa gen kòd egzanp pou sa nan
     pwojè a — mekanis siyati MonCash pa konfime, chèche l nan dokiman
     machann ou resevwa lè kont lan aktive**), epi rele
     `updatePaymentTransactionStatus` ak mete `sales.payment_status` ajou.
   - Menm bagay la pou NatCash (`/api/payments/natcash/...`).

3. **Flux nan POS**
   - Lè kesye a chwazi `moncash`/`natcash`, kreye `payment_transactions`
     (`status: "pending"`), redirije/montre yon QR/lyen peman.
   - Pandan n ap tann konfimasyon, montre yon eta "N ap tann peman..." —
     "poll" `payment_transactions.status` chak kèk segonn oswa itilize
     Supabase Realtime.

4. **Rekonsilyasyon**
   - Si yon webhook pa rive (koneksyon founisè ki fèb), bay yon aksyon
     manyèl "Verifye estati peman" ki rele API founisè a dirèkteman.

5. **Sekirite**
   - Verifye siyati/tokens webhook yo selon dokiman founisè a — pa janm
     fè konfyans a yon webhook san verifikasyon.
   - Kle sekrè yo rete sèvè-kote sèlman (deja aplike nan `01-setup.md`).

## Kritè pou konsidere etap la fini

- [ ] Yon vant tès ka peye ak MonCash sandbox e `payment_status` vin `paid`.
- [ ] Menm bagay la pou NatCash sandbox (oswa mock si pa gen kont machann
      toujou).
- [ ] Webhook yo verifye otantisite anvan yo modifye done.

## Pwochen etap

Kontinye ak `08-pwa.md`.
