-- Korije yon bug grav: chak politik RLS "store isolation" (categories,
-- credit_payments, customers, devices, payment_transactions, products,
-- profiles, sale_items, sales, stores, subscriptions, support_tickets)
-- itilize yon sou-rekèt bri sou `profiles` (`store_id IN (select
-- profiles.store_id from profiles where profiles.id = auth.uid())`) pou
-- jwenn boutik itilizatè a. Politik SELECT `profiles` a li menm itilize
-- egzakteman menm modèl la sou pwòp tab li — sa kreye yon rekiziyon
-- enfini: Postgres reponn "infinite recursion detected in policy for
-- relation 'profiles'" (42P17) pou NENPÒT rekèt otantifye ki pa
-- platform_admin, sou NENPÒT tab. Verifye dirèkteman kont Supabase live a
-- (impèsonasyon `set local role authenticated` + `auth.uid()` manyèl).
--
-- Rezon `is_platform_admin()` pa gen menm pwoblèm nan menmsi li tou li
-- `profiles`: li se `security definer`, kidonk lekti `profiles` anndan l
-- kontoune RLS. Solisyon an: menm modèl la — yon fonksyon
-- `security definer` ki bay `store_id` itilizatè aktyèl la, e chak
-- politik rele fonksyon sa a olye yon sou-rekèt bri sou `profiles`.

create function my_store_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select store_id from profiles where id = auth.uid()
$$;

revoke all on function my_store_id() from public;
grant execute on function my_store_id() to authenticated;

alter policy profiles_select_same_store on profiles
  using (store_id = my_store_id() or is_platform_admin());

alter policy categories_store_isolation on categories
  using (store_id = my_store_id() or is_platform_admin());

alter policy credit_payments_store_isolation on credit_payments
  using (store_id = my_store_id() or is_platform_admin());

alter policy customers_store_isolation on customers
  using (store_id = my_store_id() or is_platform_admin());

alter policy devices_select_member on devices
  using (store_id = my_store_id() or is_platform_admin());

alter policy payment_transactions_store_isolation on payment_transactions
  using (store_id = my_store_id() or is_platform_admin());

alter policy products_store_isolation on products
  using (store_id = my_store_id() or is_platform_admin());

alter policy sale_items_store_isolation on sale_items
  using (
    sale_id in (select sales.id from sales where sales.store_id = my_store_id())
    or is_platform_admin()
  );

alter policy sales_store_isolation on sales
  using (store_id = my_store_id() or is_platform_admin());

alter policy stores_select_member on stores
  using (id = my_store_id() or is_platform_admin());

alter policy subscriptions_select_member on subscriptions
  using (store_id = my_store_id() or is_platform_admin());

alter policy support_tickets_store_isolation on support_tickets
  using (store_id = my_store_id() or is_platform_admin());
