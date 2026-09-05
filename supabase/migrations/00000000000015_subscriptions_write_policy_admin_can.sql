-- Ekriti sou `subscriptions` rezève pou platform_admin sèlman depi
-- migration 001 — kounye a ajoute filtraj granilè pa sou-wòl admin
-- (`admin_can('manage_subscriptions')`) an plis de `is_platform_admin()`.

alter policy subscriptions_write_platform_admin on subscriptions
  with check (is_platform_admin() and admin_can('manage_subscriptions'));

alter policy subscriptions_update_platform_admin on subscriptions
  using (is_platform_admin() and admin_can('manage_subscriptions'));

alter policy subscriptions_delete_platform_admin on subscriptions
  using (is_platform_admin() and admin_can('manage_subscriptions'));
