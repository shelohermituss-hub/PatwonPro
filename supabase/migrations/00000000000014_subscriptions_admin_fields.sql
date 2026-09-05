-- Ajoute 'suspended' (aksyon Suspann/Reyaktive admin pa t gen okenn valè
-- reyèl pou vize) + chan ajan rekouvreman/dat dènye rapèl. `days_late`/
-- `amount_due_htg` rete KALKILE (fonksyon SQL), jamè estoke — yon sèl
-- sous verite (`current_period_end` vs `now()`), pa gen risk dezenkwonize.

alter table subscriptions drop constraint subscriptions_status_check;
alter table subscriptions add constraint subscriptions_status_check check (status in (
  'trialing', 'active', 'past_due', 'canceled', 'expired', 'suspended'
));

alter table subscriptions
  add column collection_agent_id uuid references profiles(id) on delete set null,
  add column last_reminder_at timestamptz;

create function subscription_days_late(s subscriptions)
returns integer
language sql
stable
set search_path = public
as $$
  select case
    when s.status in ('past_due', 'suspended') and s.current_period_end is not null
      then greatest(0, extract(day from now() - s.current_period_end)::integer)
    else 0
  end;
$$;
