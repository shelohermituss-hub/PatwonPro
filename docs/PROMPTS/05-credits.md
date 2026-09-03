# 05 — Kredi kliyan ("fè kredi")

## Objektif

Anpil ti boutik ann Ayiti vann a kredi bay kliyan yo fè konfyans. Bati jesyon
kredi: swiv konbyen chak kliyan dwe, anrejistre vèsman, e alète lè yon limit
kredi pre pou depase.

## Depandans

Etap sa a depann de `04-pos.md` (peman `credit` deja disponib kòm yon
`payment_method` nan vant).

## Sa pou fè

1. **Lis kliyan ak balans**
   - `(dashboard)/credits/page.tsx` — lis kliyan ki gen `credit_balance > 0`,
     triye pa balans desandan.
   - Rechèch pa non/telefòn.

2. **Detay kliyan**
   - Istorik vant a kredi ak vèsman pou yon kliyan espesifik.
   - Bouton "Anrejistre yon vèsman" (`credit_payments`) — mete ajou
     `customers.credit_balance` (fè sa nan yon fonksyon Postgres pou
     kenbe koyerans, pa de apèl separe kliyan-kote).

3. **Limit kredi**
   - Lè yon kesye eseye fè yon vant a kredi ki ta fè
     `credit_balance + total > credit_limit`, montre yon avètisman (men pa
     bloke definitivman — se yon desizyon biznis pwopriyetè a ka pran).

4. **Alèt dèt an reta**
   - Yon dèt kredi ki gen plis pase X jou san vèsman parèt kòm "an reta"
     (badge wouj) — X konfigirab pa boutik pita, `30` jou pa default.

5. **Sync offline**
   - `credit_payments` yo anrejistre menm jan ak `sales` (lokal Dexie
     `sync_status: "pending"` → sync lè online). Balans kliyan an ka
     kalkile lokalman kòm total dèt mwens total vèsman, men verite final la
     se sèvè a (Postgres function) apre sync.

## Kritè pou konsidere etap la fini

- [ ] Yon vant a kredi ogmante `credit_balance` kliyan an kòrèkteman.
- [ ] Yon vèsman diminye `credit_balance` kòrèkteman.
- [ ] Avètisman limit kredi parèt san bloke vant lan.
- [ ] Fonksyonalite a mache offline e sync apre.

## Pwochen etap

Kontinye ak `06-reports.md`.
