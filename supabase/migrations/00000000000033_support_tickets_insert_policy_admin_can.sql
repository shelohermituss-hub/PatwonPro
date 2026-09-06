-- `support_tickets_insert` (migration 017) kite nenpòt platform_admin
-- kreye yon tikè san `admin_can('manage_support')` — sèl chemen ekriti
-- sou `support_tickets` ki pa t swiv menm règ ke update/delete
-- (ki deja egzije `manage_support` depi migration 017). Chemen manm
-- boutik la (`store_id = my_store_id()`) rete san chanje.

alter policy support_tickets_insert on support_tickets
  with check (store_id = my_store_id() or (is_platform_admin() and admin_can('manage_support')));
