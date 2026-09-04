-- Kenbe `customers.credit_balance` koyeran otomatikman, san okenn kliyan
-- (POS, kredi manyèl, senkwonizasyon) pa bezwen sonje fè yon dezyèm apèl
-- separe apre chak vant a kredi/vèsman — docs/PROMPTS/05-credits.md
-- egzije sa a atravè "yon fonksyon Postgres", isit la fèt kòm trigger pou
-- kouvri tout chemen ekriti (POS, /credits/new, sync push) san eksepsyon.
--
-- `after insert` sèlman (pa `update`): id yo jenere kliyan-kote e sync la
-- fè yon `upsert` idanpotan (gade kòmantè nan src/lib/sync/sales.ts) — si
-- yon vant/vèsman deja egziste sou sèvè a e kliyan an re-eseye, sa vin yon
-- `update`, non yon `insert`, kidonk balans lan pa konte de fwa.

create function apply_credit_sale_balance()
returns trigger
language plpgsql
as $$
begin
  if new.payment_method = 'credit' and new.customer_id is not null then
    update customers
    set credit_balance = credit_balance + new.total
    where id = new.customer_id;
  end if;
  return new;
end;
$$;

create trigger sales_credit_balance_insert
  after insert on sales
  for each row
  execute function apply_credit_sale_balance();

create function apply_credit_payment_balance()
returns trigger
language plpgsql
as $$
begin
  update customers
  set credit_balance = credit_balance - new.amount
  where id = new.customer_id;
  return new;
end;
$$;

create trigger credit_payments_balance_insert
  after insert on credit_payments
  for each row
  execute function apply_credit_payment_balance();
