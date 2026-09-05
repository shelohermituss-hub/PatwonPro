-- Jounal odit — fòm egzak (id, actor_id, actor_role, action, resource_type,
-- resource_id, store_id, reason, metadata, ip_address, created_at).
-- Append-only : okenn policy update/delete, menm pou platform_admin —
-- menm prensip ke `stock_entries` (000008).

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  actor_role text,
  action text not null,
  resource_type text not null,
  resource_id text,
  store_id uuid references stores(id) on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;

create policy audit_logs_select_admin on audit_logs
  for select using (is_platform_admin());
create policy audit_logs_insert_admin on audit_logs
  for insert with check (is_platform_admin());
