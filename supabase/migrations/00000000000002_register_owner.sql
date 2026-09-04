-- Kreyasyon boutik + pwofil owner atomik, apre yon itilizatè fin kreye
-- kont Supabase Auth li (email+modpas). Fonksyon `security definer`
-- paske `stores`/`profiles` pa gen politik RLS "insert" pou yon itilizatè
-- ki poko gen pwofil — sa entansyonèl (evite yon kliyan kreye pwòp wòl
-- `platform_admin` oswa yon boutik pou yon lòt moun).

create function register_owner(store_name text, owner_full_name text)
returns stores
language plpgsql
security definer
set search_path = public
as $$
declare
  new_store stores;
begin
  if auth.uid() is null then
    raise exception 'Ou dwe konekte anvan ou kreye yon boutik.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Yon pwofil deja egziste pou kont sa a.';
  end if;

  if store_name is null or length(trim(store_name)) = 0 then
    raise exception 'Non boutik la obligatwa.';
  end if;

  if owner_full_name is null or length(trim(owner_full_name)) = 0 then
    raise exception 'Non konplè pwopriyetè a obligatwa.';
  end if;

  insert into stores (name, owner_id)
  values (trim(store_name), auth.uid())
  returning * into new_store;

  insert into profiles (id, store_id, full_name, role)
  values (auth.uid(), new_store.id, trim(owner_full_name), 'owner');

  return new_store;
end;
$$;

revoke all on function register_owner(text, text) from public;
grant execute on function register_owner(text, text) to authenticated;
