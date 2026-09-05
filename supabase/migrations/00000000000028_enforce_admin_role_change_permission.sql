-- `profiles_all_platform_admin` (migration 001) se yon FOR ALL laj —
-- nesesè pou platform_admin jere pwofil kòmèsan. Men chanje `admin_role`
-- yon LÒT admin se yon aksyon sansib ki dwe rezève a `manage_team`
-- sèlman (super_admin), pa nenpòt sou-wòl. Yon trigger senp, pa yon
-- dezyèm policy, paske "WITH CHECK" pa gen aksè fasil ak OLD.* pou
-- konpare ki chan chanje.
create function enforce_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.admin_role is distinct from old.admin_role and not admin_can('manage_team') then
    raise exception 'Ou pa gen dwa chanje wòl admin yon manm ekip.';
  end if;
  return new;
end;
$$;

create trigger profiles_enforce_admin_role_change
  before update on profiles
  for each row
  execute function enforce_admin_role_change();
