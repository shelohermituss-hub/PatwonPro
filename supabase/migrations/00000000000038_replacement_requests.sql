-- Demand ranplasman tablèt — menm patwon ke `support_tickets` (migration
-- 00000000000017) : kòmèsan kreye/li pwòp demand li, sèlman admin
-- (`admin_can('manage_devices')`, deja gen field_agent/operations_manager)
-- ka modifye/rezoud yo.

create table replacement_requests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  device_id uuid not null references devices(id) on delete cascade,
  reason text not null,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'completed')
  ),
  replacement_device_id uuid references devices(id) on delete set null,
  resolution_note text,
  resolved_by uuid references profiles(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table replacement_requests enable row level security;

create index replacement_requests_store_id_idx on replacement_requests (store_id);

create policy replacement_requests_select on replacement_requests
  for select using (store_id = my_store_id() or is_platform_admin());
create policy replacement_requests_insert on replacement_requests
  for insert with check (store_id = my_store_id() or is_platform_admin());
create policy replacement_requests_update_admin on replacement_requests
  for update using (is_platform_admin() and admin_can('manage_devices'));
create policy replacement_requests_delete_admin on replacement_requests
  for delete using (is_platform_admin() and admin_can('manage_devices'));
