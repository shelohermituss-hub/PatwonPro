-- Fonksyon rapò (docs/PROMPTS/06-reports.md) — kalkile agregasyon yo sou
-- sèvè a (pa Dexie) pou pwofite endèks Postgres yo, tankou dokiman an
-- egzije. Yo pa `security definer` — RLS sou `sales`/`sale_items`/
-- `products` toujou aplike selon sesyon itilizatè a k ap rele fonksyon
-- an, kidonk `store_id_param` se yon filtè adisyonèl, pa yon fason pou
-- kontounen izolasyon pa boutik la.

create function report_summary(store_id_param uuid, from_ts timestamptz, to_ts timestamptz)
returns table (
  total_sales numeric,
  transaction_count bigint,
  avg_basket numeric,
  estimated_profit numeric
)
language sql
stable
set search_path = public
as $$
  select
    coalesce(sum(s.total), 0) as total_sales,
    count(s.id) as transaction_count,
    case
      when count(s.id) = 0 then 0
      else coalesce(sum(s.total), 0) / count(s.id)
    end as avg_basket,
    coalesce((
      select sum((si.unit_price - p.cost_price) * si.quantity)
      from sale_items si
      join sales s2 on s2.id = si.sale_id
      join products p on p.id = si.product_id
      where s2.store_id = store_id_param
        and s2.created_at >= from_ts
        and s2.created_at < to_ts
    ), 0) as estimated_profit
  from sales s
  where s.store_id = store_id_param
    and s.created_at >= from_ts
    and s.created_at < to_ts;
$$;

create function report_payment_breakdown(store_id_param uuid, from_ts timestamptz, to_ts timestamptz)
returns table (
  payment_method text,
  total numeric,
  transaction_count bigint
)
language sql
stable
set search_path = public
as $$
  select s.payment_method, sum(s.total) as total, count(*) as transaction_count
  from sales s
  where s.store_id = store_id_param
    and s.created_at >= from_ts
    and s.created_at < to_ts
  group by s.payment_method;
$$;

-- `bucket_unit` se 'hour' oswa 'day' — yon agiman fonksyon ki pase kòm
-- paramèt bound nan `date_trunc`, pa konkatennen nan SQL, donk pa gen
-- risk enjeksyon.
create function report_sales_trend(
  store_id_param uuid,
  from_ts timestamptz,
  to_ts timestamptz,
  bucket_unit text
)
returns table (
  bucket_start timestamptz,
  total numeric
)
language sql
stable
set search_path = public
as $$
  select date_trunc(bucket_unit, s.created_at) as bucket_start, sum(s.total) as total
  from sales s
  where s.store_id = store_id_param
    and s.created_at >= from_ts
    and s.created_at < to_ts
  group by 1
  order by 1;
$$;

create function report_top_products(
  store_id_param uuid,
  from_ts timestamptz,
  to_ts timestamptz,
  limit_count int default 10
)
returns table (
  product_id uuid,
  product_name text,
  quantity_sold numeric,
  total_value numeric
)
language sql
stable
set search_path = public
as $$
  select si.product_id, p.name as product_name, sum(si.quantity) as quantity_sold, sum(si.line_total) as total_value
  from sale_items si
  join sales s on s.id = si.sale_id
  join products p on p.id = si.product_id
  where s.store_id = store_id_param
    and s.created_at >= from_ts
    and s.created_at < to_ts
  group by si.product_id, p.name
  order by total_value desc
  limit limit_count;
$$;

revoke all on function report_summary(uuid, timestamptz, timestamptz) from public;
revoke all on function report_payment_breakdown(uuid, timestamptz, timestamptz) from public;
revoke all on function report_sales_trend(uuid, timestamptz, timestamptz, text) from public;
revoke all on function report_top_products(uuid, timestamptz, timestamptz, int) from public;

grant execute on function report_summary(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function report_payment_breakdown(uuid, timestamptz, timestamptz) to authenticated;
grant execute on function report_sales_trend(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function report_top_products(uuid, timestamptz, timestamptz, int) to authenticated;
