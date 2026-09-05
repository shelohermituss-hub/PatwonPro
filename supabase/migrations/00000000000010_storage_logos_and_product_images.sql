-- Logo boutik + foto pwodwi (docs/CLAUDE.md modil "Paramèt boutik", modil
-- "Pwodwi ak stòk") — de bucket Storage piblik-li-sèlman, chak chemen
-- objè prefikse pa `{store_id}/...` pou RLS ka izole ekriti pa boutik san
-- gen bezwen yon tab metadata separe. Lekti piblik (menm jan yon lojo
-- pwodwi/boutik pa done sansib) ; ekriti rezève pou `owner` (menm modèl
-- ke `products`/`categories`/`customers` depi migration 007).

insert into storage.buckets (id, name, public)
values ('store-logos', 'store-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "store_logos_select" on storage.objects
  for select using (bucket_id = 'store-logos');

create policy "store_logos_write_owner" on storage.objects
  for all
  using (
    bucket_id = 'store-logos'
    and is_owner()
    and (storage.foldername(name))[1] = my_store_id()::text
  )
  with check (
    bucket_id = 'store-logos'
    and is_owner()
    and (storage.foldername(name))[1] = my_store_id()::text
  );

create policy "product_images_select" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_write_owner" on storage.objects
  for all
  using (
    bucket_id = 'product-images'
    and is_owner()
    and (storage.foldername(name))[1] = my_store_id()::text
  )
  with check (
    bucket_id = 'product-images'
    and is_owner()
    and (storage.foldername(name))[1] = my_store_id()::text
  );

alter table stores add column logo_url text;
alter table products add column image_url text;
