-- Tantativ peman kòmèsan pou pwòp abònman/kosyon li — pa yon fil datant
-- admin (kontrèman ak `support_tickets`) : chemen "kontan" an antyèman
-- otomatik, san entèvansyon moun. Kòmèsan an kreye pwòp liy li lè li
-- kòmanse yon peman (sèvè aksyon, kliyan lye ak sesyon an — RLS
-- otorize sa), epi menm sèvè aksyon an ba fè yon "verify" gateway ki
-- soti swa `pending` swa `paid`. Sèl lè li vin `paid` ke yon dezyèm
-- sèvè aksyon (createAdminClient(), egzakteman menm jistifikasyon ke
-- yon webhook founisè peman) modifye `subscriptions`/`deposits` ak
-- ekri `platform_transactions` — kòmèsan an pa janm ekri sa yo
-- dirèkteman.

create table subscription_payments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  kind text not null check (kind in ('subscription', 'deposit')),
  deposit_id uuid references deposits(id) on delete set null,
  amount_htg numeric(12, 2) not null,
  method text not null check (method in ('moncash', 'natcash')),
  gateway_transaction_id text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  constraint subscription_payments_deposit_kind_check check (
    (kind = 'deposit') = (deposit_id is not null)
  )
);

alter table subscription_payments enable row level security;

create index subscription_payments_store_id_idx on subscription_payments (store_id);

-- Kòmèsan kreye/li pwòp tantativ li ; okenn chemen UPDATE pou li — chak
-- chanjman estati soti nan yon sèvè aksyon ki sèvi ak createAdminClient()
-- (kontoune RLS), oswa yon admin.
create policy subscription_payments_select on subscription_payments
  for select using (store_id = my_store_id() or is_platform_admin());
create policy subscription_payments_insert on subscription_payments
  for insert with check (store_id = my_store_id() or is_platform_admin());
create policy subscription_payments_update_admin on subscription_payments
  for update using (is_platform_admin());
