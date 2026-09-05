-- Menm prensip ke 000015, pou `devices`.

alter policy devices_write_platform_admin on devices
  with check (is_platform_admin() and admin_can('manage_devices'));

alter policy devices_update_platform_admin on devices
  using (is_platform_admin() and admin_can('manage_devices'));

alter policy devices_delete_platform_admin on devices
  using (is_platform_admin() and admin_can('manage_devices'));
