-- Revni pwòp Jere Boutik SÈLMAN (abònman, kosyon, enstalasyon...) —
-- pa jamè lavant yon boutik, ki toujou li nan `sales`/`payment_transactions`
-- ki egziste deja. Insert-only, tankou `stock_entries` (000008) — okenn
-- policy update/delete, yon korije se yon nouvo liy `manual_adjustment`.

create table platform_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'subscription_payment', 'deposit_received', 'deposit_refunded',
    'installation_fee', 'accessory_sale', 'discount', 'manual_adjustment'
  )),
  store_id uuid references stores(id) on delete set null,
  amount_htg numeric(12, 2) not null,
  method text not null check (method in ('cash', 'moncash', 'natcash', 'bank')),
  occurred_at timestamptz not null default now(),
  note text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table platform_transactions enable row level security;

create policy platform_transactions_select_admin on platform_transactions
  for select using (is_platform_admin());
create policy platform_transactions_insert_admin on platform_transactions
  for insert with check (is_platform_admin() and admin_can('manage_transactions'));
