-- Pèmèt admin anrejistre yon "modèl" tablèt (mak, modèl, foto, kantite)
-- an yon sèl kou olye kreye chak tablèt yonn pa yonn : `model_photo_url`
-- se yon sèl foto pataje pa tout tablèt ki gen menm mak/modèl, ranpli
-- yon sèl fwa lè `createDeviceBatch()` ensere `quantity` liy `devices`.

alter table devices add column model_photo_url text;

-- Bucket piblik-li-sèlman pou foto modèl tablèt yo. Kontrèman ak
-- `store-logos`/`product-images`/`payment-qr-codes` (chemen prefikse
-- `{store_id}/...`, ekriti rezève pou `owner`), tablèt yo se envantè
-- platfòm — pa gen `store_id` toutotan yo pa asiyen, kidonk ekriti a
-- rezève dirèkteman a `admin_can('manage_devices')`, menm règ ke ekriti
-- sou tab `devices` li menm (migration 016).
insert into storage.buckets (id, name, public)
values ('device-photos', 'device-photos', true)
on conflict (id) do nothing;

create policy "device_photos_select" on storage.objects
  for select using (bucket_id = 'device-photos');

create policy "device_photos_write_admin" on storage.objects
  for all
  using (bucket_id = 'device-photos' and is_platform_admin() and admin_can('manage_devices'))
  with check (bucket_id = 'device-photos' and is_platform_admin() and admin_can('manage_devices'));
