-- Migrasyon 031 te sere `stores_all_platform_admin` (FOR ALL) dèyè
-- `admin_can('manage_stores')`, men `stores_update_owner` (migration
-- 001, FOR UPDATE sèlman) gen pwòp klòz "OR is_platform_admin()" li ki
-- toujou pèmisiv san `admin_can()` — de policy pèmisiv yo konbine ak
-- OR nan RLS, kidonk sa a te bypass rezèv 031 la pou UPDATE espesifikman
-- (verifye ak yon tès imitasyon reyèl: yon sou-wòl `read_only` te ka
-- toujou modifye yon boutik atravè chemen sa a). Kòrije l pou l swiv
-- menm règ la: pwopriyetè a toujou ka modifye pwòp boutik li san okenn
-- kondisyon anplis, men chemen platform_admin nan MENM policy sa a
-- kounye a egzije `manage_stores` tou.

alter policy stores_update_owner on stores
  using (owner_id = auth.uid() or (is_platform_admin() and admin_can('manage_stores')));
