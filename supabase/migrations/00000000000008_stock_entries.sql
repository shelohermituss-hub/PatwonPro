-- Modil "Antre Stòk ak Ajisteman" (docs/CLAUDE.md modil #4) — te dokimante
-- depi Phase 1 (dosye/nav egziste) men pa t janm gen yon tab pou li.
-- Ledger apenn ajoute (append-only): pa gen politik UPDATE/DELETE ditou,
-- menm pou platform_admin — yon korije fèt an ajoutan yon nouvo ranje
-- "correction", jamè an modifye istorik la. Menm modèl ak
-- credit_balance: yon trigger `security definer` sèl aplike efè a sou
-- `products.stock_quantity`, paske `employee` pa gen dwa ekri `products`
-- dirèkteman ankò (00000000000007).

create table stock_entries (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  employee_id uuid not null references profiles (id),
  entry_type text not null check (entry_type in ('restock', 'correction', 'adjustment')),
  quantity_delta numeric(12, 2) not null check (quantity_delta <> 0),
  stock_before numeric(12, 2) not null default 0,
  stock_after numeric(12, 2) not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create index stock_entries_store_id_idx on stock_entries (store_id);
create index stock_entries_product_id_idx on stock_entries (product_id);
create index stock_entries_created_at_idx on stock_entries (created_at);

alter table stock_entries enable row level security;

create policy stock_entries_select_member on stock_entries
  for select using (store_id = my_store_id() or is_platform_admin());

create policy stock_entries_insert_owner on stock_entries
  for insert with check (is_platform_admin() or (store_id = my_store_id() and is_owner()));

create function apply_stock_entry_delta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update products
  set stock_quantity = greatest(stock_quantity + new.quantity_delta, 0)
  where id = new.product_id;
  return new;
end;
$$;

create trigger stock_entries_apply_delta
  after insert on stock_entries
  for each row
  execute function apply_stock_entry_delta();
