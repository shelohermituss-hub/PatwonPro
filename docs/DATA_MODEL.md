# Modèl Done — Jere Boutik Pro

Tout tab yo viv nan Postgres (Supabase) e gen yon miwa lokal nan Dexie pou tab ki nesesè pou POS offline (`products`, `customers`, `sales`, `sale_items`, `credit_payments`).

## Tab prensipal

### `stores`
Boutik la (tenant).
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| name | text | Non boutik la |
| owner_id | uuid FK -> auth.users | Pwopriyetè |
| currency | text | Default `HTG` |
| address | text | |
| phone | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `profiles`
Ekstansyon `auth.users` pou jere wòl.
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK FK -> auth.users | |
| store_id | uuid FK -> stores | |
| full_name | text | |
| role | text | `owner` \| `manager` \| `cashier` |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `categories`
| Chan | Tip |
|---|---|
| id | uuid PK |
| store_id | uuid FK |
| name | text |
| created_at | timestamptz |
| updated_at | timestamptz |

### `products`
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| category_id | uuid FK nullable | |
| name | text | |
| sku | text nullable | Kòd bakòd / referans |
| unit | text | ex: `inite`, `liv`, `galon` |
| cost_price | numeric | Pri achte |
| sale_price | numeric | Pri vann |
| stock_quantity | numeric | Kantite an stòk |
| low_stock_threshold | numeric | Alèt stòk ba |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `customers`
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| full_name | text | |
| phone | text nullable | |
| credit_limit | numeric | Limit kredi otorize |
| credit_balance | numeric | Total yo dwe kounye a |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `sales`
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK (jenere kliyan-kote) | Pèmèt idanpotans lè sync |
| store_id | uuid FK | |
| cashier_id | uuid FK -> profiles | |
| customer_id | uuid FK nullable | Nil = vant kach san kliyan spesifik |
| subtotal | numeric | |
| discount | numeric | |
| total | numeric | |
| payment_method | text | `cash` \| `moncash` \| `natcash` \| `credit` |
| payment_status | text | `paid` \| `partial` \| `credit` |
| sync_status | text | `pending` \| `synced` (jere lokalman, pa nesesèman kolòn DB) |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `sale_items`
| Chan | Tip |
|---|---|
| id | uuid PK |
| sale_id | uuid FK -> sales |
| product_id | uuid FK -> products |
| quantity | numeric |
| unit_price | numeric |
| line_total | numeric |
| created_at | timestamptz |

### `credit_payments`
Kliyan k ap peye yon dèt kredi pa vèsman.
| Chan | Tip |
|---|---|
| id | uuid PK |
| store_id | uuid FK |
| customer_id | uuid FK |
| sale_id | uuid FK nullable | Referans vant orijinal la si genyen |
| amount | numeric |
| payment_method | text |
| created_at | timestamptz |

### `payment_transactions`
Rejis apèl API MonCash/NatCash (pou odit ak rekonsilyasyon).
| Chan | Tip |
|---|---|
| id | uuid PK |
| store_id | uuid FK |
| sale_id | uuid FK nullable |
| provider | text | `moncash` \| `natcash` |
| provider_reference | text | ID transaksyon founisè a |
| amount | numeric |
| status | text | `pending` \| `success` \| `failed` |
| created_at | timestamptz |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

## Relasyon kle

```
stores 1───n profiles
stores 1───n products ──n:1── categories
stores 1───n customers
stores 1───n sales ──n:1── customers
sales 1───n sale_items ──n:1── products
customers 1───n credit_payments
sales 1───n payment_transactions
```

## Row Level Security (RLS)

Chak tab ki gen `store_id` gen yon politik jeneral:

```sql
create policy "store_isolation" on <table>
  using (store_id in (select store_id from profiles where id = auth.uid()));
```

Wòl `cashier` limite ekriti sou `sales`/`sale_items`/`credit_payments` sèlman; `manager`/`owner` gen aksè total sou `products`, `customers`, ak rapò.

## Konvansyon

- Tout kolòn lajan se `numeric(12,2)`, lajan an se HTG (goud) pa default.
- Tout id se `uuid` jenere pa kliyan lè sa posib (pou sipòte kreyasyon offline).
- Chan `sync_status` la viv sèlman nan Dexie (lokal), pa nan Postgres — Supabase se toujou "synced" pa definisyon.
- Chak tab gen `created_at`; tab ki ka modifye apre kreyasyon (`stores`,
  `profiles`, `categories`, `products`, `customers`, `sales`,
  `payment_transactions`) gen anplis yon `updated_at` mete ajou
  otomatikman pa yon trigger (`set_updated_at()`, gade migrasyon inisyal
  la) — pa janm mete `updated_at` ajou manyèlman nan kòd aplikasyon an.
- Chak kolòn FK (`store_id`, `category_id`, `customer_id`, `sale_id`,
  `product_id`, `cashier_id`) gen yon endèks — gade seksyon "Endèks" nan
  migrasyon an anvan w ajoute yon nouvo tab.
