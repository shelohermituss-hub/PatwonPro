-- Anrichi `devices` ak chan back-office (san kreye yon dezyèm tab) :
-- identifiant lizib, enfòmasyon achte/reparasyon, lyen kosyon/kontra.
-- Elaji `status` (3 valè kòmèsan → 9 valè sik lavi materyèl admin),
-- ak migrasyon done ki egziste deja.

create sequence device_code_seq start 1;

alter table devices
  add column device_code text,
  add column serial_number text,
  add column brand text,
  add column model text,
  add column import_batch text,
  add column actual_cost_htg numeric(12, 2),
  add column purchase_date date,
  add column contract_number text,
  add column repair_history jsonb not null default '[]'::jsonb,
  add column photo_count integer not null default 0,
  add column installed_at date,
  add column returned_at date;

update devices
set device_code = 'JB-HT-' || lpad(nextval('device_code_seq')::text, 6, '0')
where device_code is null;

alter table devices
  alter column device_code set not null,
  add constraint devices_device_code_unique unique (device_code);

alter table devices alter column device_code set default
  ('JB-HT-' || lpad(nextval('device_code_seq')::text, 6, '0'));

-- Migre done kòmèsan ki egziste deja vè nouvo modèl la avan chanje check la.
update devices set status = 'deployed_active' where status = 'active';
update devices set status = 'in_stock' where status = 'inactive';
update devices set status = 'repair' where status = 'blocked';

alter table devices drop constraint devices_status_check;
alter table devices add constraint devices_status_check check (status in (
  'in_stock', 'reserved', 'deployed_trial', 'deployed_active',
  'repair', 'returned', 'refurbished', 'lost', 'retired'
));
