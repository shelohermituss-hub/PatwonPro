-- Chanjman achitekti peman mobil : gateway "PLOP PLOP" (Pay'm) rete
-- sèlman pou boutik la peye pwòp abònman li bay Jere Boutik (yon
-- pwochen fonksyonalite, gade platform_settings.payment_gateway_client_id).
-- Pou vant nan Pwen Vant lan, chak boutik konfigire pwòp nimewo ak kòd
-- QR MonCash/NatCash li — kesye a montre yo bay kliyan an, kliyan an
-- voye lajan an dirèkteman, epi kesye a konfime MANYÈLMAN apre li tcheke
-- sou pwòp telefòn li ke lajan an antre. Pa gen okenn apèl API pou vant.

alter table stores
  add column moncash_phone text,
  add column moncash_qr_url text,
  add column natcash_phone text,
  add column natcash_qr_url text;

-- Bucket piblik-li-sèlman pou kòd QR yo, menm patwon ke `store-logos`
-- (00000000000010) : chemen objè prefikse `{store_id}/...`, ekriti
-- rezève pou `owner`.
insert into storage.buckets (id, name, public)
values ('payment-qr-codes', 'payment-qr-codes', true)
on conflict (id) do nothing;

create policy "payment_qr_codes_select" on storage.objects
  for select using (bucket_id = 'payment-qr-codes');

create policy "payment_qr_codes_write_owner" on storage.objects
  for all
  using (
    bucket_id = 'payment-qr-codes'
    and is_owner()
    and (storage.foldername(name))[1] = my_store_id()::text
  )
  with check (
    bucket_id = 'payment-qr-codes'
    and is_owner()
    and (storage.foldername(name))[1] = my_store_id()::text
  );
