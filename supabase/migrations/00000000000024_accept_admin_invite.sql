-- Miwa egzak `accept_employee_invite()` (000009), men pou envitasyon
-- admin: li `app_metadata ->> 'invited_admin_role'` (jamè `user_metadata`,
-- ki modifyab pa kliyan an) e kreye yon pwofil `platform_admin` san
-- `store_id`.

create function accept_admin_invite(admin_full_name text)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile profiles;
  invited_role text;
begin
  if auth.uid() is null then
    raise exception 'Ou dwe konekte anvan ou aksepte envitasyon an.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Yon pwofil deja egziste pou kont sa a.';
  end if;

  invited_role := auth.jwt() -> 'app_metadata' ->> 'invited_admin_role';

  if invited_role is null or invited_role not in (
    'super_admin', 'operations_manager', 'sales_agent',
    'field_agent', 'support_agent', 'finance_agent', 'read_only'
  ) then
    raise exception 'Envitasyon sa a pa valid.';
  end if;

  if admin_full_name is null or length(trim(admin_full_name)) = 0 then
    raise exception 'Non konplè a obligatwa.';
  end if;

  insert into profiles (id, store_id, full_name, role, admin_role)
  values (auth.uid(), null, trim(admin_full_name), 'platform_admin', invited_role)
  returning * into new_profile;

  return new_profile;
end;
$$;

revoke all on function accept_admin_invite(text) from public;
grant execute on function accept_admin_invite(text) to authenticated;
