-- `stores_all_platform_admin` (migration 001) se yon FOR ALL laj —
-- `is_platform_admin()` sèlman, san `admin_can()`. Menm prensip ke
-- migrasyon 015/016 (subscriptions/devices) : ekriti rezève a
-- `admin_can('manage_stores')`, ki deja egziste kòm aksyon nan
-- `src/lib/admin/permissions.ts` men ki pa t enfòse okenn kote. Lekti
-- (`stores_select_member`) ak modifikasyon pwòp tèt pwopriyetè a
-- (`stores_update_owner`) rete entak — sèl chemen platform_admin an ki
-- resevwa nouvo garanti a.

alter policy stores_all_platform_admin on stores
  using (is_platform_admin() and admin_can('manage_stores'))
  with check (is_platform_admin() and admin_can('manage_stores'));
