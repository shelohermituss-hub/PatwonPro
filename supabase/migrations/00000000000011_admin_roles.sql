-- Wòl admin granilè (super_admin, operations_manager, sales_agent,
-- field_agent, support_agent, finance_agent, read_only) — jiska kounye a
-- yo te egziste sèlman kòte UI (src/lib/admin/permissions.ts, mock).
-- `profiles.role` (`owner|employee|platform_admin`) rete entak: se toujou
-- sèl pòtay reyèl (biznis kòmèsan vs back-office). `admin_role` se yon
-- sou-klasifikasyon, poze sèlman lè `role = 'platform_admin'`.

alter table profiles
  add column admin_role text
  check (admin_role in (
    'super_admin', 'operations_manager', 'sales_agent',
    'field_agent', 'support_agent', 'finance_agent', 'read_only'
  ));

update profiles set admin_role = 'super_admin' where role = 'platform_admin';

alter table profiles
  add constraint profiles_admin_role_matches_role check (
    (role = 'platform_admin') = (admin_role is not null)
  );

-- Miwa egzat `src/lib/admin/permissions.ts` (ACTION_PERMISSIONS) — si
-- youn chanje, chanje lòt la tou (gade docs/ADMIN_DASHBOARD_ARCHITECTURE.md).
create function admin_can(action text)
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
      'manage_support', 'manage_leads'
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

revoke all on function admin_can(text) from public;
grant execute on function admin_can(text) to authenticated;
