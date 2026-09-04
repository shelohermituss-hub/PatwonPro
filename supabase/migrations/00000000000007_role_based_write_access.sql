-- Aplike distenksyon `owner` (aksè total sou pwodwi/kliyan/kategori) vs
-- `employee` (limite a vant/kredi) ki te dokimante depi Phase 1
-- (docs/DATA_MODEL.md, docs/PROMPTS/02-auth.md) men ki pa t janm aplike
-- kòm politik RLS — chak politik "store isolation" te `FOR ALL`, louvri
-- pou nenpòt manm boutik la kèlkeswa wòl li.
--
-- `sales`/`sale_items`/`credit_payments`/`payment_transactions` PA
-- touche — yon `employee` dwe toujou ka fè vant ak anrejistre vèsman
-- kredi, se travay li.

create function is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'owner'
  );
$$;

revoke all on function is_owner() from public;
grant execute on function is_owner() to authenticated;

-- `categories`, `products`, `customers`: SELECT rete louvri a tout manm
-- boutik la (yon employee bezwen WÈ pwodwi/kliyan pou vann/fè kredi),
-- men ekri (INSERT/UPDATE/DELETE) vin rezève pou owner sèlman. De
-- politik separe obligatwa (pa yon sèl "FOR ALL" ak yon "WITH CHECK" anplis)
-- paske "WITH CHECK" pa gouvène DELETE — sèl "USING" fè sa.

drop policy categories_store_isolation on categories;
create policy categories_select_member on categories
  for select using (store_id = my_store_id() or is_platform_admin());
create policy categories_write_owner on categories
  for all
  using (is_platform_admin() or (store_id = my_store_id() and is_owner()))
  with check (is_platform_admin() or (store_id = my_store_id() and is_owner()));

drop policy products_store_isolation on products;
create policy products_select_member on products
  for select using (store_id = my_store_id() or is_platform_admin());
create policy products_write_owner on products
  for all
  using (is_platform_admin() or (store_id = my_store_id() and is_owner()))
  with check (is_platform_admin() or (store_id = my_store_id() and is_owner()));

drop policy customers_store_isolation on customers;
create policy customers_select_member on customers
  for select using (store_id = my_store_id() or is_platform_admin());
create policy customers_write_owner on customers
  for all
  using (is_platform_admin() or (store_id = my_store_id() and is_owner()))
  with check (is_platform_admin() or (store_id = my_store_id() and is_owner()));

-- Korije efè kolateral: `apply_credit_sale_balance()`/
-- `apply_credit_payment_balance()` (00000000000003) fè yon `UPDATE
-- customers` — san `security definer`, sa echwe RLS pou yon `employee`
-- kounye a paske `customers` pa louvri pou ekri ankò. Menm rezon ak
-- `is_platform_admin()`/`my_store_id()`: `security definer` fè trigger
-- la kontoune RLS, kèlkeswa wòl moun ki fè INSERT `sales`/`credit_payments`
-- la. `search_path` deja fikse sou de fonksyon sa yo depi 000004.

alter function apply_credit_sale_balance() security definer;
alter function apply_credit_payment_balance() security definer;

-- Menm jan an pou stòk: `checkoutSale()` (src/lib/pos/checkout.ts) pa
-- ekri `products` sou Supabase ankò (li rete yon patch lokal Dexie
-- sèlman, pou reyaksyon UI imedyat). Trigger sa a vin sèl sous verite
-- sèvè pou dekremantasyon stòk ki soti nan yon vant, e li ranplase
-- kalkil kliyan-kote ansyen an (ki te ka pèdi yon ekriti si de tablèt
-- vann menm pwodwi a anlè menm moman).

create function apply_sale_item_stock_decrement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update products
  set stock_quantity = greatest(stock_quantity - new.quantity, 0)
  where id = new.product_id;
  return new;
end;
$$;

create trigger sale_items_stock_decrement
  after insert on sale_items
  for each row
  execute function apply_sale_item_stock_decrement();
