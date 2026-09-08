-- Konsòl admin pou kreye/pwograme/efase kanpay notifikasyon manyèl —
-- distenk de alèt otomatik yo (rapèl abònman, stòk ba, kredi anreta,
-- erè sync) ki deja branche dirèkteman nan kòd egzistan an. Gade
-- docs/PUSH_NOTIFICATIONS_ARCH.md.

create table notification_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  target_scope text not null check (target_scope in ('all_stores', 'single_store', 'admin_team')) default 'all_stores',
  target_store_id uuid references stores (id) on delete cascade,
  category text not null default 'admin_broadcast',
  trigger_type text not null check (trigger_type in ('immediate', 'scheduled_once', 'recurring')),
  scheduled_at timestamptz,
  cron_expression text,
  status text not null check (status in ('draft', 'scheduled', 'sent', 'canceled')) default 'draft',
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  last_dispatched_at timestamptz,
  constraint notification_campaigns_scheduled_once_has_date
    check (trigger_type <> 'scheduled_once' or scheduled_at is not null),
  constraint notification_campaigns_recurring_has_cron
    check (trigger_type <> 'recurring' or cron_expression is not null),
  constraint notification_campaigns_single_store_has_target
    check (target_scope <> 'single_store' or target_store_id is not null)
);

create index notification_campaigns_status_idx on notification_campaigns (status);

alter table notification_campaigns enable row level security;

create policy "notification_campaigns_all_admin" on notification_campaigns
  for all using (is_platform_admin() and admin_can('manage_notifications'))
  with check (is_platform_admin() and admin_can('manage_notifications'));

-- `admin_can()` (migration 011) élargi — `operations_manager` gère déjà
-- devices/support/installations/stores/leads, la console notifications
-- est du même ressort opérationnel.
create or replace function admin_can(action text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case (select admin_role from profiles where id = auth.uid())
    when 'super_admin' then true
    when 'operations_manager' then action in (
      'manage_stores', 'manage_devices', 'manage_installations',
      'manage_support', 'manage_leads', 'manage_notifications'
    )
    when 'sales_agent' then action in ('manage_leads')
    when 'field_agent' then action in ('manage_installations', 'manage_devices')
    when 'support_agent' then action in ('manage_support')
    when 'finance_agent' then action in (
      'manage_subscriptions', 'manage_deposits', 'manage_transactions'
    )
    else false
  end;
$$;
