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
| logo_url | text nullable | URL piblik nan bucket Storage `store-logos` (gade seksyon Storage anba) |
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
| admin_role | text nullable | 7 valè (`super_admin`, `operations_manager`, `sales_agent`, `field_agent`, `support_agent`, `finance_agent`, `read_only`) — poze **sèlman** lè `role = 'platform_admin'` (contrainte `profiles_admin_role_matches_role`, migration 011). Baryè reyèl `/admin` yo tout pase pa `admin_can(action text)`, yon fonksyon SQL ki fè menm `case admin_role when ...` ke `src/lib/admin/permissions.ts` — de a dwe rete senkwonize manyèlman. |
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
| image_url | text nullable | URL piblik nan bucket Storage `product-images` (gade seksyon Storage anba) |
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
Rejis apèl API MonCash/NatCash (pou odit ak rekonsilyasyon), atravè yon
sèl gateway peman (`src/lib/payments/gateway.ts`). **Pa janm konfime yon
`sale.payment_status` kòm `paid` sou baz sa a sèlman san yon verifikasyon
sèvè-kote reyisi** (`GET /api/payments/status/[id]`, ki entèwoje gateway
a — pa gen webhook dokimante) — gade `docs/PROMPTS/07-payments.md`.
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
`platform_admin` (ak `admin_can('manage_subscriptions')`) sèlman.
`register_owner()` kreye yon liy `trialing`/`starter`/1200 HTG/30 jou
otomatikman lè yon boutik enskri (migration 012 — te manke anvan).
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| plan | text | `starter` \| `pro` \| `enterprise` |
| status | text | `trialing` \| `active` \| `past_due` \| `canceled` \| `expired` \| `suspended` |
| current_period_start | timestamptz nullable | |
| current_period_end | timestamptz nullable | |
| price_htg | numeric nullable | |
| collection_agent_id | uuid FK -> profiles, nullable | Admin responsab rekouvreman |
| last_reminder_at | timestamptz nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

`days_late`/`amount_due_htg` pa estoke — kalkile pa fonksyon SQL
`subscription_days_late(s subscriptions)` (`current_period_end` vs
`now()`), yon sèl sous verite.

### `devices`
Envantè tablèt konplè — pa sèlman aparèy deja asiyen a yon boutik.
`store_id`/`name` **nullable** (migration 026) paske yon tablèt ka
egziste `in_stock`/`reserved` anvan li asiyen.
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK, nullable | |
| name | text nullable | Etikèt aparèy la |
| device_identifier | text nullable | |
| device_code | text unique | Kòd lizib `JB-HT-######`, jenere pa yon sekans |
| serial_number, brand, model, import_batch | text nullable | |
| actual_cost_htg | numeric nullable | |
| purchase_date, installed_at, returned_at | date nullable | |
| contract_number | text nullable | |
| repair_history | jsonb | Lis `{date, issue, cost}` |
| photo_count | integer | |
| status | text | `in_stock` \| `reserved` \| `deployed_trial` \| `deployed_active` \| `repair` \| `returned` \| `refurbished` \| `lost` \| `retired` |
| last_seen_at | timestamptz nullable | Ranpli pa `POST /api/sync/heartbeat` |
| pending_actions, sync_errors | integer | Sante sync, ranpli pa menm heartbeat la |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `support_tickets`
Tikè sipò — mesaj inisyal sèlman pou kounye a. Manm boutik la ka
kreye/li tikè pwòp boutik li; `platform_admin` (ak
`admin_can('manage_support')` pou modifye/efase) wè/jere tout tikè.
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| created_by | uuid FK -> profiles | |
| subject | text | |
| message | text | |
| status | text | `open` \| `in_progress` \| `resolved` \| `closed` |
| category | text nullable | 9 valè (`training`, `products_stock`, ... `feature_suggestion`) — souvan `null` paske fòm kreyasyon kòmèsan an pa mande l |
| priority | text | `P1`..`P4`, default `P3` |
| assigned_agent_id | uuid FK -> profiles, nullable | |
| sla_deadline | timestamptz | Kalkile pa trigger `set_support_ticket_sla()` selon priyorite a lè INSERT |
| created_at | timestamptz | |
| updated_at | timestamptz | Ajou otomatikman pa trigger |

### `leads`
Pipeline lead/esè — okenn ekivalan reyèl anvan migration 018.
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_name, owner_name | text | |
| phone, whatsapp, address, zone, business_type | text nullable | |
| estimated_product_count, seller_count | integer nullable | |
| uses_mobile_money | boolean | |
| agent_id | uuid FK -> profiles, nullable | |
| device_id | uuid FK -> devices, nullable | |
| trial_start_date, trial_end_date | date nullable | |
| last_interaction_at | timestamptz | |
| objections, loss_reason | text nullable | |
| stage | text | 9 valè, `lead` → `converted`/`lost`/`device_recovered` |
| converted_store_id | uuid FK -> stores, nullable | Poze **manyèlman** pa yon admin ki chwazi yon vrè boutik ki egziste — jamè kreyasyon otomatik yon kont pwopriyetè |
| created_at, updated_at | timestamptz | |

### `deposits`
Kosyon materyèl — separe de revni Jere Boutik (yon obligasyon
potansyèl, pa yon vant).
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK | |
| device_id | uuid FK -> devices, nullable | |
| contract_number | text nullable | |
| amount_htg | numeric | |
| received_date | date | |
| status | text | 7 valè, `received` → `refunded`/`partially_retained`/`fully_retained` |
| eligible_refund_date | date nullable | |
| device_condition | text nullable | |
| amount_to_return_htg, amount_retained_htg | numeric nullable | |
| retention_reason | text nullable | |
| refund_proof_url | text nullable | |
| finance_agent_id | uuid FK -> profiles, nullable | |
| created_at, updated_at | timestamptz | |

### `installations`
Enstalasyon teren. `store_id`/`lead_id` nullable paske yon enstalasyon
ka fèt anvan vrè boutik la egziste (pre-konvèsyon lead).
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| store_id | uuid FK -> stores, nullable | |
| lead_id | uuid FK -> leads, nullable | |
| store_name, contact, address | text | |
| scheduled_at | timestamptz nullable | |
| agent_id | uuid FK -> profiles, nullable | |
| device_id | uuid FK -> devices, nullable | |
| status | text | `scheduled` \| `en_route` \| `installed` \| `postponed` \| `cancelled` |
| products_to_import | integer nullable | |
| checklist | jsonb | Lis `{label, done}` — chèklis fiks (`INSTALLATION_CHECKLIST_TEMPLATE`), entèraktif e pèsistan |
| photo_count | integer | |
| client_signature | boolean | |
| training_result, next_action | text nullable | |
| created_at, updated_at | timestamptz | |

### `platform_transactions`
Revni Jere Boutik SÈLMAN (abònman, kosyon, enstalasyon...) — pa jamè
lavant yon boutik, ki toujou li nan `sales`/`payment_transactions`.
Insert-only (tankou `stock_entries`) — yon korije se yon nouvo liy
`manual_adjustment`, jamè yon modifikasyon.
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| type | text | 7 valè (`subscription_payment`, `deposit_received`, ...) |
| store_id | uuid FK -> stores, nullable | |
| amount_htg | numeric | |
| method | text | `cash` \| `moncash` \| `natcash` \| `bank` |
| occurred_at | timestamptz | |
| note | text nullable | |
| created_by | uuid FK -> profiles, nullable | |
| created_at | timestamptz | |

### `platform_settings`
Kle/valè senp pou paramèt platfòm (pri plan, montan kosyon default,
delè gras, SLA P1).
| Chan | Tip |
|---|---|
| key | text PK |
| value | jsonb |
| updated_at | timestamptz |
| updated_by | uuid FK -> profiles, nullable |

### `audit_logs`
Jounal odit — append-only, okenn policy update/delete (menm prensip ke
`stock_entries`).
| Chan | Tip | Deskripsyon |
|---|---|---|
| id | uuid PK | |
| actor_id | uuid FK -> profiles, nullable | |
| actor_role | text nullable | Snapshot `admin_role` aktè a lè aksyon an fèt |
| action | text | ex: `subscription.suspended` |
| resource_type | text | |
| resource_id | text nullable | |
| store_id | uuid FK -> stores, nullable | |
| reason | text nullable | |
| metadata | jsonb | |
| ip_address | text nullable | Jamè ranpli kounye a — bezwen yon chemen sèvè, okenn aksyon admin pa pase pa yonn jodi a |
| created_at | timestamptz | |

## Storage (Supabase Storage)

De bucket piblik-li-sèlman (`00000000000010_storage_logos_and_product_images.sql`) :

| Bucket | Kolòn ki referanse l | Politik |
|---|---|---|
| `store-logos` | `stores.logo_url` | Lekti piblik ; ekriti rezève pou `owner` nan pwòp chemen `{store_id}/...` li |
| `product-images` | `products.image_url` | Lekti piblik ; ekriti rezève pou `owner` nan pwòp chemen `{store_id}/...` li |

Chemen objè yo toujou prefikse pa `{store_id}/` — se sou baz sa a RLS
(`storage.foldername(name))[1] = my_store_id()::text` konbine ak
`is_owner()`) izole ekriti pa boutik san bezwen yon tab metadata separe.
Upload fèt kliyan-kote (`src/lib/storage/uploadImage.ts`), lekti a piblik
paske yon lojo/foto pwodwi pa done sansib.

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
leads n───1 stores (converted_store_id, nullable)
leads/installations n───1 devices (nullable)
stores 1───n deposits ──n:1── devices (nullable)
stores 1───n installations (store_id/lead_id nullable)
stores 1───n platform_transactions (nullable — kèk san boutik)
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
rezève sèlman a `platform_admin` **ak** `admin_can('manage_xxx')`
(`admin_can(action text)`, migration 011 — menm patwon `security
definer stable` ke `is_platform_admin()`). Sis tab back-office admin ki
pa gen okenn manm boutik ki ka wè yo ditou (`leads`, `deposits`,
`installations`, `platform_transactions`, `platform_settings`,
`audit_logs`) swiv menm patwon : `SELECT` rezève `is_platform_admin()`,
ekriti rezève anplis `admin_can('manage_xxx')` — sof `audit_logs`, kote
nenpòt sou-wòl admin ka ekri yon antre (`is_platform_admin()` sèlman,
paske chak aksyon dwe kite yon tras kèlkeswa ki wòl fè l).

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
