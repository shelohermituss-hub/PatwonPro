-- PatwonPro — schema inisyal
-- Gade docs/DATA_MODEL.md pou deskripsyon chak tab.

create extension if not exists "pgcrypto";

-- =========================================================================
-- Fonksyon itil
-- =========================================================================

-- Mete `updated_at` ajou otomatikman sou chak `update` (gade trigger yo pi ba).
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `platform_admin` se ekip PatwonPro la (jesyon abònman/aparèy/sipò/kont
-- atravè TOUT boutik) — li pa gen yon sèl boutik, donk `store_id` nul pou
-- wòl sa a sèlman. Chak lòt wòl DWE gen yon `store_id`.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  store_id uuid references stores (id) on delete cascade,
  full_name text not null,
  role text not null default 'employee' check (role in ('owner', 'employee', 'platform_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_store_id_matches_role check (
    (role = 'platform_admin' and store_id is null)
    or (role <> 'platform_admin' and store_id is not null)
  )
);

-- `is_platform_admin()`: `security definer` pou evite rekiziyon RLS lè
-- politik yon lòt tab tcheke wòl itilizatè aktyèl la kont `profiles`.
create function is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'platform_admin'
  );
$$;

create table categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  full_name text not null,
  phone text,
  credit_limit numeric(12, 2) not null default 0,
  credit_balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sales (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  employee_id uuid not null references profiles (id),
  customer_id uuid references customers (id) on delete set null,
  subtotal numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  payment_method text not null check (payment_method in ('cash', 'moncash', 'natcash', 'credit')),
  payment_status text not null default 'paid' check (payment_status in ('paid', 'partial', 'credit')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales (id) on delete cascade,
  product_id uuid not null references products (id),
  quantity numeric(12, 2) not null,
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now()
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

-- `status`: eta transaksyon founisè peman an (diferan de `sales.payment_status`,
-- ki se eta règleman VANT lan). `raw_event` kenbe payload webhook orijinal
-- la (jsonb) pou odit/depanaj — pa janm mete yon sekrè (siyati/kle) ladan l.
create table payment_transactions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  sale_id uuid references sales (id) on delete set null,
  provider text not null check (provider in ('moncash', 'natcash')),
  provider_reference text,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled', 'expired')),
  raw_event jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Abònman boutik la (jere pa `platform_admin`, li sèlman pou pwopriyetè/anplwaye).
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'enterprise')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  price_htg numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tablèt/aparèy anrejistre pou yon boutik.
create table devices (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  name text not null,
  device_identifier text,
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tikè sipò — mesaj inisyal sèlman; yon tab `support_ticket_messages`
-- ka ajoute pita si yon vrè fil konvèsasyon nesesè.
create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores (id) on delete cascade,
  created_by uuid not null references profiles (id),
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================================
-- Trigger `updated_at`
-- =========================================================================

create trigger stores_set_updated_at before update on stores
  for each row execute function set_updated_at();

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger categories_set_updated_at before update on categories
  for each row execute function set_updated_at();

create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

create trigger customers_set_updated_at before update on customers
  for each row execute function set_updated_at();

create trigger sales_set_updated_at before update on sales
  for each row execute function set_updated_at();

create trigger payment_transactions_set_updated_at before update on payment_transactions
  for each row execute function set_updated_at();

create trigger subscriptions_set_updated_at before update on subscriptions
  for each row execute function set_updated_at();

create trigger devices_set_updated_at before update on devices
  for each row execute function set_updated_at();

create trigger support_tickets_set_updated_at before update on support_tickets
  for each row execute function set_updated_at();

-- =========================================================================
-- Endèks
-- =========================================================================

create index profiles_store_id_idx on profiles (store_id);
create index categories_store_id_idx on categories (store_id);
create index products_store_id_idx on products (store_id);
create index products_category_id_idx on products (category_id);
create index customers_store_id_idx on customers (store_id);
create index sales_store_id_idx on sales (store_id);
create index sales_customer_id_idx on sales (customer_id);
create index sales_employee_id_idx on sales (employee_id);
create index sale_items_sale_id_idx on sale_items (sale_id);
create index sale_items_product_id_idx on sale_items (product_id);
create index credit_payments_store_id_idx on credit_payments (store_id);
create index credit_payments_customer_id_idx on credit_payments (customer_id);
create index credit_payments_sale_id_idx on credit_payments (sale_id);
create index payment_transactions_store_id_idx on payment_transactions (store_id);
create index payment_transactions_sale_id_idx on payment_transactions (sale_id);
create index subscriptions_store_id_idx on subscriptions (store_id);
create index devices_store_id_idx on devices (store_id);
create index support_tickets_store_id_idx on support_tickets (store_id);
create index support_tickets_created_by_idx on support_tickets (created_by);

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
alter table subscriptions enable row level security;
alter table devices enable row level security;
alter table support_tickets enable row level security;

-- `stores`: manm boutik la wè l; `platform_admin` wè tout boutik.
create policy "stores_select_member" on stores
  for select using (
    id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "stores_update_owner" on stores
  for update using (owner_id = auth.uid() or is_platform_admin());

create policy "stores_all_platform_admin" on stores
  for all using (is_platform_admin());

-- `profiles`: itilizatè a wè pwòp pwofil li ak lòt pwofil menm boutik la;
-- `platform_admin` wè/jere tout kont.
create policy "profiles_select_same_store" on profiles
  for select using (
    store_id in (select store_id from profiles p where p.id = auth.uid())
    or is_platform_admin()
  );

create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

create policy "profiles_all_platform_admin" on profiles
  for all using (is_platform_admin());

-- Politik jeneral pou tab ki gen `store_id`: izolasyon pa boutik, ak
-- `platform_admin` ki gen aksè atravè tout boutik.
create policy "categories_store_isolation" on categories
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "products_store_isolation" on products
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "customers_store_isolation" on customers
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "sales_store_isolation" on sales
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "sale_items_store_isolation" on sale_items
  for all using (
    sale_id in (
      select id from sales
      where sales.store_id in (select store_id from profiles where profiles.id = auth.uid())
    )
    or is_platform_admin()
  );

create policy "credit_payments_store_isolation" on credit_payments
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "payment_transactions_store_isolation" on payment_transactions
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

-- `subscriptions`: manm boutik la LI sèlman pwòp abònman li; sèl
-- `platform_admin` ka kreye/modifye (yon boutik pa dwe chanje pwòp bòday
-- fakti li).
create policy "subscriptions_select_member" on subscriptions
  for select using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "subscriptions_write_platform_admin" on subscriptions
  for insert with check (is_platform_admin());

create policy "subscriptions_update_platform_admin" on subscriptions
  for update using (is_platform_admin());

create policy "subscriptions_delete_platform_admin" on subscriptions
  for delete using (is_platform_admin());

-- `devices`: menm prensip ak `subscriptions` — pwovizyone yon tablèt se
-- yon aksyon platfòm/sipò, pa yon aksyon boutik.
create policy "devices_select_member" on devices
  for select using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );

create policy "devices_write_platform_admin" on devices
  for insert with check (is_platform_admin());

create policy "devices_update_platform_admin" on devices
  for update using (is_platform_admin());

create policy "devices_delete_platform_admin" on devices
  for delete using (is_platform_admin());

-- `support_tickets`: yon manm boutik ka kreye/li tikè pwòp boutik li;
-- `platform_admin` wè/jere tout tikè.
create policy "support_tickets_store_isolation" on support_tickets
  for all using (
    store_id in (select store_id from profiles where profiles.id = auth.uid())
    or is_platform_admin()
  );
