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
   - Konplete `src/lib/payments/moncash.ts` ak `natcash.ts` (deja gen yon
     eskèlèt) — ajoute verifikasyon estati tranzaksyon.

2. **Route handlers**
   - `src/app/api/payments/moncash/route.ts` — kreye yon peman
     (`createMonCashPayment`) epi retounen URL redireksyon an bay fwontyè a.
   - `src/app/api/payments/moncash/webhook/route.ts` — resevwa notifikasyon
     MonCash, verifye siyati/otantisite, mete `payment_transactions` ak
     `sales.payment_status` ajou.
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
