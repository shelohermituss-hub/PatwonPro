-- Twou reyèl dekouvri pandan travay sou /admin : `register_owner()`
-- (migration 002) pa t janm kreye yon liy `subscriptions` — okenn
-- nouvo boutik pa t gen abònman ditou, ni kòte kòmèsan (/subscription)
-- ni kòte admin (/admin/subscriptions). Korije isit la: chak nouvo
-- boutik kòmanse ak yon esè 30 jou, plan 'starter', pri 1200 HTG (menm
-- valè pa defo ki nan /admin/settings).

create or replace function register_owner(store_name text, owner_full_name text)
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

  insert into subscriptions (
    store_id, plan, status, price_htg,
    current_period_start, current_period_end
  )
  values (
    new_store.id, 'starter', 'trialing', 1200,
    now(), now() + interval '30 days'
  );

  return new_store;
end;
$$;
