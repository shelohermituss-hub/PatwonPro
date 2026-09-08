-- Aktive pg_cron/pg_net (deja disponib sou Supabase, jiska prezan
-- jiska pa aktive sou pwojè sa a) — deklanche fonksyon SQL ki anba yo
-- via yon apèl HTTP tounen nan `POST /api/push/dispatch`, menm patron
-- ke `docs/CLAUDE.md` deja dokimante pou entegrasyon Supabase.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Called from `src/lib/admin/mutations/notificationCampaigns.ts`
-- (`createNotificationCampaign`) right after inserting a
-- `scheduled_once`/`recurring` row — `dispatch_url`/`dispatch_secret`
-- are built server-side from the request's own host + `PUSH_DISPATCH_SECRET`
-- (same trick `resetOwnerPassword.ts` already uses for its redirect
-- URL), never hardcoded here since the deployed domain isn't known at
-- migration time. `cron.schedule` upserts by job name, so calling this
-- again for the same campaign (e.g. editing its schedule) just updates it.
create function schedule_notification_campaign_cron(
  campaign_id uuid,
  cron_expr text,
  dispatch_url text,
  dispatch_secret text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (is_platform_admin() and admin_can('manage_notifications')) then
    raise exception 'Ou pa gen dwa pwograme yon kanpay notifikasyon.';
  end if;

  perform cron.schedule(
    'campaign_' || campaign_id::text,
    cron_expr,
    format(
      $cmd$select net.http_post(url := %L, headers := %L::jsonb, body := %L::jsonb)$cmd$,
      dispatch_url,
      json_build_object('Content-Type', 'application/json', 'x-push-dispatch-secret', dispatch_secret)::text,
      json_build_object('kind', 'campaign', 'campaignId', campaign_id)::text
    )
  );
end;
$$;

revoke all on function schedule_notification_campaign_cron(uuid, text, text, text) from public;
grant execute on function schedule_notification_campaign_cron(uuid, text, text, text) to authenticated;

-- Called on delete (`deleteNotificationCampaign`) and after a
-- `scheduled_once` campaign fires (`POST /api/push/dispatch`, via the
-- service-role client bypassing this permission check — see that
-- route) so a one-off job doesn't linger and accidentally refire.
-- Only enforces the admin-permission check for a normal authenticated
-- session (`auth.uid()` set) — a call from `createAdminClient()`
-- (service role, no JWT, `auth.uid()` is null) has no session to check
-- against, and is already a trusted server-only context by the
-- guarantee documented on `createAdminClient()` itself.
create function unschedule_notification_campaign_cron(campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not (is_platform_admin() and admin_can('manage_notifications')) then
    raise exception 'Ou pa gen dwa anile pwogramasyon yon kanpay notifikasyon.';
  end if;

  perform cron.unschedule('campaign_' || campaign_id::text);
exception when others then
  -- Job already gone (never scheduled, or already unscheduled) — not an error.
  null;
end;
$$;

revoke all on function unschedule_notification_campaign_cron(uuid) from public;
grant execute on function unschedule_notification_campaign_cron(uuid) to authenticated, service_role;

-- Daily stock-bas / kredi-anreta check — (re)scheduled idempotently
-- every time `/admin/notifications` loads (`ensureScheduledAlertsCron`
-- Server Action), so it self-heals after a redeploy to a new domain
-- instead of needing a one-time manual SQL step.
create function ensure_scheduled_alerts_cron(dispatch_url text, dispatch_secret text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (is_platform_admin() and admin_can('manage_notifications')) then
    raise exception 'Ou pa gen dwa konfigire alèt otomatik yo.';
  end if;

  perform cron.schedule(
    'daily_notification_alerts',
    '0 8 * * *',
    format(
      $cmd$select net.http_post(url := %L, headers := %L::jsonb, body := %L::jsonb)$cmd$,
      dispatch_url,
      json_build_object('Content-Type', 'application/json', 'x-push-dispatch-secret', dispatch_secret)::text,
      json_build_object('kind', 'scheduled_alerts')::text
    )
  );
end;
$$;

revoke all on function ensure_scheduled_alerts_cron(text, text) from public;
grant execute on function ensure_scheduled_alerts_cron(text, text) to authenticated;
