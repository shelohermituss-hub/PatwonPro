-- Pipeline lead/esè (9 etap) — okenn ekivalan reyèl pa t egziste anvan.
-- `converted_store_id` poze MANYÈLMAN pa yon admin (li chwazi yon vrè
-- boutik ki egziste deja) — pa gen kreyasyon otomatik yon fo kont
-- pwopriyetè.

create table leads (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  owner_name text not null,
  phone text,
  whatsapp text,
  address text,
  zone text,
  business_type text,
  estimated_product_count integer,
  seller_count integer,
  uses_mobile_money boolean not null default false,
  agent_id uuid references profiles(id) on delete set null,
  device_id uuid references devices(id) on delete set null,
  trial_start_date date,
  trial_end_date date,
  last_interaction_at timestamptz not null default now(),
  objections text,
  loss_reason text,
  stage text not null default 'lead' check (stage in (
    'lead', 'contacted', 'demo_scheduled', 'demo_done', 'trial_installed',
    'trial_active', 'converted', 'lost', 'device_recovered'
  )),
  converted_store_id uuid references stores(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table leads enable row level security;

create policy leads_select_admin on leads
  for select using (is_platform_admin());
create policy leads_write_admin on leads
  for all
  using (is_platform_admin() and admin_can('manage_leads'))
  with check (is_platform_admin() and admin_can('manage_leads'));

create trigger leads_set_updated_at
  before update on leads
  for each row
  execute function set_updated_at();
