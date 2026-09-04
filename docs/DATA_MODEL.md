# Modèl Done — PatwonPro

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
| store_id | uuid FK -> stores, **nullable** | Nul sèlman pou `platform_admin` — wòl sa a pa apatyen a yon sèl boutik |
| full_name | text | |
| role | text | `owner` \| `employee` \| `platform_admin` |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

**Wòl yo**:
- `owner` — pwopriyetè boutik la, aksè total sou pwòp boutik li.
- `employee` — anplwaye/vandè, aksè limite a vant ak kredi.
- `platform_admin` — ekip PatwonPro la, jere abònman/tablèt/sipò/kont
  **atravè tout boutik** (gade `stores_all_platform_admin` ak politik
  RLS parèy nan migrasyon an — chak politik izolasyon-pa-boutik gen yon
  `or is_platform_admin()` ki bay wòl sa a aksè global).

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
| employee_id | uuid FK -> profiles | Anplwaye ki fè vant lan (renome de `cashier_id`) |
| customer_id | uuid FK nullable | Nil = vant kach san kliyan spesifik |
| subtotal | numeric | |
| discount | numeric | |
| total | numeric | |
| payment_method | text | `cash` \| `moncash` \| `natcash` \| `credit` |
| payment_status | text | `paid` \| `partial` \| `credit` — eta **règleman vant lan**, diferan de `payment_transactions.status` |
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
Rejis apèl API MonCash/NatCash (pou odit ak rekonsilyasyon). **Pa janm
konfime yon `sale.payment_status` kòm `paid` sou baz sa a sèlman san yon
webhook siyati verifye** — gade `docs/PROMPTS/07-payments.md`.
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| sale_id | uuid FK nullable | |
| provider | text | `moncash` \| `natcash` |
| provider_reference | text | ID transaksyon founisè a |
| amount | numeric | |
| status | text | `pending` \| `paid` \| `failed` \| `cancelled` \| `expired` |
| raw_event | jsonb nullable | Payload webhook orijinal la (odit/depanaj) — pa janm mete yon sekrè/siyati ladan l |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `subscriptions`
Abònman boutik la — **LI sèlman pou `owner`/`employee`**, ekri se
`platform_admin` sèlman (yon boutik pa dwe chanje pwòp bòday fakti li).
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| plan | text | `starter` \| `pro` \| `enterprise` |
| status | text | `trialing` \| `active` \| `past_due` \| `canceled` \| `expired` |
| current_period_start | timestamptz nullable | |
| current_period_end | timestamptz nullable | |
| price_htg | numeric nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `devices`
Tablèt/aparèy anrejistre pou yon boutik — menm règ aksè ak `subscriptions`
(li pou manm boutik la, ekri pou `platform_admin`).
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| name | text | Etikèt aparèy la (ex: "Tablèt Kesye 1") |
| device_identifier | text nullable | |
| status | text | `active` \| `inactive` \| `blocked` |
| last_seen_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `support_tickets`
Tikè sipò — mesaj inisyal sèlman pou kounye a; yon tab
`support_ticket_messages` ka ajoute pita si yon vrè fil konvèsasyon
nesesè. Manm boutik la ka kreye/li tikè pwòp boutik li; `platform_admin`
wè/jere tout tikè.
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| created_by | uuid FK -> profiles | |
| subject | text | |
| message | text | |
| status | text | `open` \| `in_progress` \| `resolved` \| `closed` |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

## Relasyon kle

```
stores 1───n profiles (sof platform_admin, ki pa gen store_id)
stores 1───n products ──n:1── categories
stores 1───n customers
stores 1───n sales ──n:1── customers
sales 1───n sale_items ──n:1── products
customers 1───n credit_payments
sales 1───n payment_transactions
stores 1───1 subscriptions
stores 1───n devices
stores 1───n support_tickets
```

## Row Level Security (RLS)

Chak tab ki gen `store_id` gen yon politik jeneral ki bay ni manm boutik
la (pa `store_id`) ni `platform_admin` (aksè global) aksè:

```sql
create policy "store_isolation" on <table>
  using (
    store_id in (select store_id from profiles where id = auth.uid())
    or is_platform_admin()
  );
```

`is_platform_admin()` se yon fonksyon SQL `security definer` (gade
migrasyon inisyal la) ki verifye wòl itilizatè aktyèl la san lakòz
rekiziyon RLS sou `profiles`.

`subscriptions` ak `devices` fè eksepsyon: **LI** swiv règ jeneral la
(manm boutik oswa `platform_admin`), men **ekri** (insert/update/delete)
rezève sèlman a `platform_admin` — pwovizyone yon tablèt oswa chanje yon
abònman se yon aksyon platfòm, pa yon aksyon boutik.

Distenksyon `owner` (aksè total sou pwòp boutik) vs `employee` (limite a
vant/kredi) poko enplemante kòm politik RLS pa-wòl nan migrasyon inisyal
la — sa vin fèt nan `docs/PROMPTS/02-auth.md`.

## Konvansyon

- Tout kolòn lajan se `numeric(12,2)`, lajan an se HTG (goud) pa default.
- Tout id se `uuid` jenere pa kliyan lè sa posib (pou sipòte kreyasyon offline).
- Chan `sync_status` la viv sèlman nan Dexie (lokal), pa nan Postgres — Supabase se toujou "synced" pa definisyon.
- Chak tab gen `created_at`; tab ki ka modifye apre kreyasyon gen anplis
  yon `updated_at` mete ajou otomatikman pa yon trigger (`set_updated_at()`,
  gade migrasyon inisyal la) — pa janm mete `updated_at` ajou manyèlman
  nan kòd aplikasyon an.
- Chak kolòn FK gen yon endèks — gade seksyon "Endèks" nan migrasyon an
  anvan w ajoute yon nouvo tab.
