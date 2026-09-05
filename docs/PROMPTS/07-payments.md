# 07 — Entegrasyon MonCash & NatCash

## Objektif

Konekte flux POS la ak peman mobil MonCash ak NatCash pou vant peye ak
telefòn kliyan an, olye kach sèlman.

## Depandans

Etap sa a depann de `04-pos.md` (POS la deja gen `payment_method` kòm chwa).

## Sa ki reyèlman konstwi

**Fondasyon reyèl, dokimante**: entegrasyon an bati sou "API Paiement &
Retrait Marchand v1.4" (gateway "PLOP PLOP", `docs/CLAUDE.md` pa mansyone
non founisè a paske se yon detay entèn, pa yon chwa pwodwi machann wè) —
yon PDF machann founi dirèkteman, tout chan/wout yo verifye kont li mo pou
mo, pa yon vèsyon devine. **Yon sèl API pou de mwayen peman yo**:
`payment_method: "moncash"` oswa `"natcash"` nan menm apèl la — kontrèman
ak yon vèsyon anvan ki te eseye entegre MonCash dirèkteman (API Digicel)
ak NatCash kòm yon plasholder devine san dokiman piblik.

1. `src/lib/payments/gateway.ts` — sèl kliyan an pou de mwayen yo:
   - `createGatewayPayment` → `POST /api/paiement-marchand`
     (`client_id`, `refference_id`, `montant` >= 20 HTG,
     `payment_method`). Retounen yon URL redireksyon + yon
     `transaction_id` (ID gateway a, diferan de `refference_id` machann
     lan).
   - `verifyGatewayPayment` → `POST /api/paiement-verify`
     (`client_id`, `refference_id`). Retounen `trans_status`: `"no"`
     (an atant) oswa `"ok"` (konfime) — `mapGatewayStatus()` tradui sa
     an `"paid" | "unresolved"`.
2. **Pa gen webhook/IPN nan dokiman gateway a** — sèl mekanis
   konfimasyon dokimante se apèl `paiement-verify` a. Kidonk **"poll" se
   mekanis prensipal konfimasyon an**, pa yon fallback:
   - `POST /api/payments/create` — kreye yon `payment_transactions`
     (status `pending`, `id` la sèvi kòm `refference_id` gateway a),
     rele `createGatewayPayment`, retounen yon URL redireksyon.
   - `GET /api/payments/status/[id]` — "poll" chak 4 segonn
     (`usePaymentGateway.ts`) — verifye kont gateway a si toujou
     `pending`, mete `payment_transactions` ajou si konfime.
   - `POST /api/payments/status/[id]` — `{action: "cancel"}` (kesye a
     anile) oswa `{action: "link-sale", saleId}` (mare tranzaksyon an ak
     vant lan yon fwa Dexie kreye l).
3. **Flux nan POS** (`(dashboard)/sales/new`, `CartPanel.tsx`) — chwazi
   `moncash` **oswa** `natcash` louvri `PaymentGatewayDialog` (kòd QR ki
   kode URL redireksyon an, pou kliyan an eskane ak pwòp telefòn li san
   POS la pa kite paj la) — menm dyalòg, menm hook (`usePaymentGateway`),
   sèl `payment_method` la chanje. Vant lan (`checkoutSale`, Dexie)
   sèlman kreye **apre** konfimasyon — pa gen "vant pandan" nan Dexie.
4. **Retrè machann pa entegre** — API a gen tou yon flux separe pou
   retire solde prepeye machann lan (otantifikasyon + siyati
   HMAC-SHA256 an 3 etap) — sa a rete pou yon demann separe, se pa yon
   objektif Pwen Vant.

## Kritè pou konsidere etap la fini

- [x] MonCash ak NatCash: chan/wout verifye kont dokiman ofisyèl gateway
      a — de founisè yo pase pa menm kòd la.
- [x] Webhook: okenn webhook pa dokimante — poll rete sèl mekanis
      konfimasyon, jan dokiman an mande.
- [ ] Yon vant tès ka peye ak MonCash/NatCash sandbox e `payment_status`
      vin `paid` (kòd la pare, men poko teste kont yon vrè kont
      machann).

## Pwochen etap

Kontinye ak `08-pwa.md`.
