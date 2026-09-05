-- Paramèt platfòm senp kle/valè, pou /admin/settings pèsiste vre.

create table platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id) on delete set null
);

alter table platform_settings enable row level security;

create policy platform_settings_select_admin on platform_settings
  for select using (is_platform_admin());
create policy platform_settings_write_admin on platform_settings
  for all
  using (is_platform_admin() and admin_can('manage_settings'))
  with check (is_platform_admin() and admin_can('manage_settings'));

insert into platform_settings (key, value) values
  ('plan_prices_htg', '{"starter": 1200, "standard": 1800, "pro": 2500}'::jsonb),
  ('deposit_amount_htg', '6000'::jsonb),
  ('grace_period_days', '7'::jsonb),
  ('sla_p1_label', '"Menm jou"'::jsonb);
