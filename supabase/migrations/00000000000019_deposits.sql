-- Kosyon materyèl (sik ranbousman 7 etap) — okenn ekivalan reyèl pa t
-- egziste anvan.

create table deposits (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  device_id uuid references devices(id) on delete set null,
  contract_number text,
  amount_htg numeric(12, 2) not null,
  received_date date not null default current_date,
  status text not null default 'received' check (status in (
    'received', 'held', 'eligible_for_refund', 'refund_requested',
    'refunded', 'partially_retained', 'fully_retained'
  )),
  eligible_refund_date date,
  device_condition text,
  amount_to_return_htg numeric(12, 2),
  amount_retained_htg numeric(12, 2),
  retention_reason text,
  refund_proof_url text,
  finance_agent_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table deposits enable row level security;

create policy deposits_select_admin on deposits
  for select using (is_platform_admin());
create policy deposits_write_admin on deposits
  for all
  using (is_platform_admin() and admin_can('manage_deposits'))
  with check (is_platform_admin() and admin_can('manage_deposits'));

create trigger deposits_set_updated_at
  before update on deposits
  for each row
  execute function set_updated_at();
