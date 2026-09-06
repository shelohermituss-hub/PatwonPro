# 07 — MonCash & NatCash nan Pwen Vant

## Objektif

Pèmèt yon vant peye ak MonCash oswa NatCash, san okenn depandans sou yon
gateway pou vant lan — kliyan an voye lajan an dirèkteman nan kont mobil
money pwòp boutik la, kesye a konfime manyèlman.

## Depandans

Etap sa a depann de `04-pos.md` (POS la deja gen `payment_method` kòm chwa).

## Achitekti reyèl

**Chak boutik konfigire pwòp kont li**, pa yon kont platfòm pataje :
- `/settings` (`MobilePaymentConfigForm`) — pwopriyetè a antre nimewo
  MonCash ak nimewo NatCash pwòp boutik li, epi voye yon foto/kòd QR pou
  chak (bucket Storage `payment-qr-codes`, menm patwon ke `store-logos`
  — chemen `{store_id}/...`, lekti piblik, ekriti rezève `owner`).
  Estoke sou `stores.moncash_phone`/`moncash_qr_url`/`natcash_phone`/
  `natcash_qr_url` (migration 029).
- Nan Pwen Vant (`(dashboard)/sales/new`), chwazi `moncash` oswa
  `natcash` louvri `MobilePaymentConfirmDialog` : li montre logo,
  nimewo, ak kòd QR **boutik la** (`useStorePaymentConfig` li kolòn yo
  dirèkteman), ansanm yon konsiy — "Mande kliyan an voye [montan] sou
  nimewo sa a, tcheke sou pwòp telefòn ou anvan w konfime."
- **Okenn apèl API pa fèt.** Kesye a klike "Konfime — Lajan an Antre"
  sèlman apre li verifye manyèlman resepsyon an sou pwòp telefòn li.
  Sa lanse `checkoutSale()` egzakteman menm jan ak yon vant kach —
  `payment_status` vin `paid` imedyatman, pa gen "vant pandan" k ap tann
  yon konfimasyon.
- Si yon boutik poko konfigire yon mwayen, dyalòg la montre sa klèman
  epi voye kesye a nan Paramèt olye kite l eseye peye san enfòmasyon.

## Sa ki pa fè pati de flux sa a

**Gateway "PLOP PLOP" (Pay'm)** (`src/lib/payments/gateway.ts`,
`API Paiement & Retrait Marchand v1.4`, documanted, testé kont PDF
machann lan mo pou mo) **pa itilize pou vant Pwen Vant ankò**. Rezon an :
lajan yon vant se lajan **boutik la**, li ale dirèkteman nan pwòp kont
mobil money pwopriyetè a — pa gen okenn rezon pou l pase pa yon gateway
platfòm.

Sèl rezon gateway sa a rete nan kòd la : yon boutik ka gen pou peye
**pwòp abònman li bay Jere Boutik**, e sa a se yon peman POU platfòm
lan, PA yon vant. `platform_settings.payment_gateway_client_id`
(konfigirab sou `/admin/settings`) deja pare pou sa, men **pa gen
okenn wout/UI ki konekte avè l kounye a** — se yon pwochen
fonksyonalite (yon jou lè boutik la ap peye abònman li, pa lè l ap vann
bay kliyan).

## Kritè pou konsidere etap la fini

- [x] Chak boutik ka konfigire pwòp nimewo + kòd QR MonCash/NatCash sou `/settings`.
- [x] Yon vant MonCash/NatCash konplete imedyatman apre konfimasyon manyèl kesye a — pa gen apèl API, pa gen "poll".
- [x] Si yon mwayen pa konfigire, dyalòg la anpeche konfizyon (mesaj klè, pa yon bouton "Konfime" ki pa ta dwe la).
- [x] Gateway Pay'm PLOP PLOP rete disponib (client_id konfigirab) pou fiti fonksyonalite abònman, san li melanje ak vant.

## Pwochen etap

Kontinye ak `08-pwa.md`.
