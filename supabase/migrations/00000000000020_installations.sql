-- Enstalasyon teren — `store_id`/`lead_id` aksepte null paske yon
-- enstalasyon ka fèt anvan yon vrè boutik egziste (pre-konvèsyon lead).
-- `checklist` se yon lis kèk itèm jsonb entèraktif e pèsistan (pa tankou
-- Sheet lekti sèlman faz 1 la).

create table installations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  store_name text not null,
  contact text,
  address text,
  scheduled_at timestamptz,
  agent_id uuid references profiles(id) on delete set null,
  device_id uuid references devices(id) on delete set null,
  status text not null default 'scheduled' check (status in (
    'scheduled', 'en_route', 'installed', 'postponed', 'cancelled'
  )),
  products_to_import integer,
  checklist jsonb not null default '[]'::jsonb,
  photo_count integer not null default 0,
  client_signature boolean not null default false,
  training_result text,
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table installations enable row level security;

create policy installations_select_admin on installations
  for select using (is_platform_admin());
create policy installations_write_admin on installations
  for all
  using (is_platform_admin() and admin_can('manage_installations'))
  with check (is_platform_admin() and admin_can('manage_installations'));

create trigger installations_set_updated_at
  before update on installations
  for each row
  execute function set_updated_at();
