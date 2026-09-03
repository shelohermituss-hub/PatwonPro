-- Jere Boutik Pro — schema inisyal
-- Gade docs/DATA_MODEL.md pou deskripsyon chak tab.

create extension if not exists "pgcrypto";

-- =========================================================================
-- Tabs
-- =========================================================================

create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  currency text not null default 'HTG',
  address text,
  phone text,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  store_id uuid not null references stores (id) on delete cascade,
  full_name text not null,
  role text not null default 'cashier' check (role in ('owner', 'manager', 'cashier')),
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  name text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  category_id uuid references categories (id) on delete set null,
  name text not null,
  sku text,
  unit text not null default 'inite',
  cost_price numeric(12, 2) not null default 0,
  sale_price numeric(12, 2) not null default 0,
  stock_quantity numeric(12, 2) not null default 0,
  low_stock_threshold numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  full_name text not null,
  phone text,
  credit_limit numeric(12, 2) not null default 0,
  credit_balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  cashier_id uuid not null references profiles (id),
  customer_id uuid references customers (id) on delete set null,
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  payment_method text not null check (payment_method in ('cash', 'moncash', 'natcash', 'credit')),
  payment_status text not null default 'paid' check (payment_status in ('paid', 'partial', 'credit')),
  created_at timestamptz not null default now()
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales (id) on delete cascade,
  product_id uuid not null references products (id),
  quantity numeric(12, 2) not null,
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null
);

create table credit_payments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete cascade,
  sale_id uuid references sales (id) on delete set null,
  amount numeric(12, 2) not null,
  payment_method text not null check (payment_method in ('cash', 'moncash', 'natcash', 'credit')),
  created_at timestamptz not null default now()
);

create table payment_transactions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  sale_id uuid references sales (id) on delete set null,
  provider text not null check (provider in ('moncash', 'natcash')),
  provider_reference text,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now()
);

-- =========================================================================
-- Endèks
-- =========================================================================

create index products_store_id_idx on products (store_id);
create index customers_store_id_idx on customers (store_id);
create index sales_store_id_idx on sales (store_id);
create index sales_customer_id_idx on sales (customer_id);
create index sale_items_sale_id_idx on sale_items (sale_id);
create index credit_payments_customer_id_idx on credit_payments (customer_id);

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table stores enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table credit_payments enable row level security;
alter table payment_transactions enable row level security;

-- `stores`: itilizatè a wè sèlman boutik kote li gen yon pwofil.
create policy "stores_select_member" on stores
  for select using (
    id in (select store_id from profiles where profiles.id = auth.uid())
  );

create policy "stores_update_owner" on stores
  for update using (owner_id = auth.uid());

-- `profiles`: itilizatè a wè pwòp pwofil li ak lòt pwofil menm boutik la.
create policy "profiles_select_same_store" on profiles
  for select using (
    store_id in (select store_id from profiles p where p.id = auth.uid())
  );

create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

-- Politik jeneral pou tab ki gen `store_id`: izolasyon pa boutik.
create policy "categories_store_isolation" on categories
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
  );

create policy "products_store_isolation" on products
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
  );

create policy "customers_store_isolation" on customers
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
  );

create policy "sales_store_isolation" on sales
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
  );

create policy "sale_items_store_isolation" on sale_items
  for all using (
    sale_id in (
      select id from sales
      where sales.store_id in (select store_id from profiles where profiles.id = auth.uid())
    )
  );

create policy "credit_payments_store_isolation" on credit_payments
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
  );

create policy "payment_transactions_store_isolation" on payment_transactions
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
  );
