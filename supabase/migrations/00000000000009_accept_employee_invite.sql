-- Aksepte envitasyon anplwaye (docs/PROMPTS/02-auth.md) — miroir
-- `register_owner()` (00000000000002) men pou yon anplwaye envite pa yon
-- owner. Li `store_id`/`role` sèlman nan `app_metadata` (JWT), jamè
-- `user_metadata`/`raw_user_meta_data` — sa a se sèl kanal yon itilizatè
-- pa ka falsifye limenm (`app_metadata` modifyab sèlman sèvè, ak
-- `service_role`, gade src/lib/auth/inviteEmployee.ts). Sinon nenpòt moun
-- ki kreye yon kont ta ka envite tèt li nan nenpòt boutik.

create function accept_employee_invite(employee_full_name text)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile profiles;
  invited_store_id uuid;
  invited_role text;
begin
  if auth.uid() is null then
    raise exception 'Ou dwe konekte anvan ou aksepte envitasyon an.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Yon pwofil deja egziste pou kont sa a.';
  end if;

  invited_store_id := (auth.jwt() -> 'app_metadata' ->> 'invited_store_id')::uuid;
  invited_role := auth.jwt() -> 'app_metadata' ->> 'invited_role';

  if invited_store_id is null or invited_role is distinct from 'employee' then
    raise exception 'Envitasyon sa a pa valid.';
  end if;

  if not exists (select 1 from stores where id = invited_store_id) then
    raise exception 'Boutik la pa egziste ankò.';
  end if;

  if employee_full_name is null or length(trim(employee_full_name)) = 0 then
    raise exception 'Non konplè anplwaye a obligatwa.';
  end if;

  insert into profiles (id, store_id, full_name, role)
  values (auth.uid(), invited_store_id, trim(employee_full_name), 'employee')
  returning * into new_profile;

  return new_profile;
end;
$$;

revoke all on function accept_employee_invite(text) from public;
grant execute on function accept_employee_invite(text) to authenticated;
