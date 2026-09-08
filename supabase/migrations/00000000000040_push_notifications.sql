-- Notifikasyon push (Web Push standard, VAPID) — abònman navigatè,
-- preferans pa kategori, ak jounal voye/echwe. Gade
-- src/lib/push/{subscribe,send}.ts ak docs/PUSH_NOTIFICATIONS_ARCH.md.

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  store_id uuid references stores (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index push_subscriptions_profile_id_idx on push_subscriptions (profile_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_select_self" on push_subscriptions
  for select using (profile_id = auth.uid() or is_platform_admin());

create policy "push_subscriptions_write_self" on push_subscriptions
  for all using (profile_id = auth.uid() or is_platform_admin())
  with check (profile_id = auth.uid() or is_platform_admin());

-- Yon liy pa pwofil — swiche aktive pa defo pou pa fè spam, sof rapèl
-- ki deja egziste kòm SMS/WhatsApp (Twilio) e ki merite yon doubl kanal.
create table notification_preferences (
  profile_id uuid primary key references profiles (id) on delete cascade,
  subscription_reminders boolean not null default true,
  low_stock boolean not null default true,
  credit_overdue boolean not null default true,
  sync_errors boolean not null default true,
  new_sales boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table notification_preferences enable row level security;

create policy "notification_preferences_select_self" on notification_preferences
  for select using (profile_id = auth.uid() or is_platform_admin());

create policy "notification_preferences_write_self" on notification_preferences
  for all using (profile_id = auth.uid() or is_platform_admin())
  with check (profile_id = auth.uid() or is_platform_admin());

-- Jounal append-only (menm patron ak audit_logs/stock_entries) — pa gen
-- policy update/delete, menm pou platform_admin.
create table notification_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles (id) on delete set null,
  store_id uuid references stores (id) on delete set null,
  category text not null check (category in (
    'subscription_reminder', 'low_stock', 'credit_overdue', 'sync_error',
    'new_sale', 'refund', 'admin_broadcast'
  )),
  title text not null,
  body text not null,
  status text not null check (status in ('sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);

create index notification_logs_profile_id_idx on notification_logs (profile_id);
create index notification_logs_created_at_idx on notification_logs (created_at);

alter table notification_logs enable row level security;

create policy "notification_logs_select_self" on notification_logs
  for select using (profile_id = auth.uid() or is_platform_admin());

-- Defense-in-depth only — the real writer (`src/lib/push/send.ts`) always
-- uses `createAdminClient()` (service role, bypasses RLS) since it's
-- called from contexts with no admin session at all (the sync heartbeat
-- route under a regular employee's session, or `POST /api/push/dispatch`
-- triggered by `pg_cron` with a shared secret, no Supabase session).
create policy "notification_logs_insert_service" on notification_logs
  for insert with check (is_platform_admin());
