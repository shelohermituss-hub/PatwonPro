-- Retargete konsòl notifikasyon an sou yon itilizatè spesifik (chèche pa
-- non) olye de yon boutik — pi fleksib (kapab vize nenpòt pwofil: owner,
-- employee, oswa platform_admin), epi ajoute yon "Kalite" (Info/Siksè/
-- Avètisman/Ijans) tankou sa deja egziste nan lòt platfòm.

alter table notification_campaigns
  add column target_profile_id uuid references profiles (id) on delete cascade;

alter table notification_campaigns
  add column notification_type text not null default 'info'
    check (notification_type in ('info', 'success', 'warning', 'urgent'));

-- Drop the old constraints *before* touching data — the old
-- target_scope check doesn't allow 'single_user' yet.
alter table notification_campaigns
  drop constraint notification_campaigns_single_store_has_target;
alter table notification_campaigns
  drop constraint notification_campaigns_target_scope_check;

-- Migre done ki deja egziste : yon kanpay 'single_store' ki gen yon
-- target_store_id vin yon 'single_user' ki vize pwopriyetè boutik la.
update notification_campaigns nc
set target_profile_id = p.id
from profiles p
where nc.target_scope = 'single_store'
  and nc.target_store_id is not null
  and p.store_id = nc.target_store_id
  and p.role = 'owner';

update notification_campaigns
set target_scope = 'single_user'
where target_scope = 'single_store';

alter table notification_campaigns
  drop constraint notification_campaigns_target_store_id_fkey;
alter table notification_campaigns
  drop column target_store_id;

alter table notification_campaigns
  add constraint notification_campaigns_target_scope_check
  check (target_scope in ('all_stores', 'single_user', 'admin_team'));

alter table notification_campaigns
  add constraint notification_campaigns_single_user_has_target
  check (target_scope <> 'single_user' or target_profile_id is not null);
