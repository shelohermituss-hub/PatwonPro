"use server";

import { getCurrentProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { isPlatformAdmin } from "@/lib/auth/roles";
import { can } from "@/lib/admin/permissions";
import { computeDaysLate } from "@/lib/admin/queries/subscriptions";

const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

interface SubscriptionRow {
  status: string;
  price_htg: number | null;
  current_period_end: string | null;
  store: { id: string; name: string; phone: string | null } | { id: string; name: string; phone: string | null }[] | null;
}

/** Haiti numbers stored as local 8-digit numbers (or already E.164) — normalize to +509XXXXXXXX. */
function toE164Haiti(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (rawPhone.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("509")) return `+${digits}`;
  return `+509${digits}`;
}

async function sendTwilioMessage(to: string, from: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    return { ok: false, error: "Twilio pa konfigire (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN)." };
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, error: data?.message ?? `Twilio echwe: ${response.status}` };
  }
  return { ok: true };
}

/**
 * Sends a real SMS + WhatsApp reminder via Twilio's REST API (plain
 * `fetch` with Basic Auth — no need for the full `twilio` npm SDK for a
 * single POST). Runs server-side only (needs `TWILIO_AUTH_TOKEN`, a
 * secret). Updates `last_reminder_at` only if at least one channel
 * actually sent; writes its own `audit_logs` row here since a Server
 * Action has no browser client to call the client-only
 * `recordAuditEvent` with.
 */
export async function sendSubscriptionReminder(subscriptionId: string): Promise<{ error: string | null }> {
  const profile = await getCurrentProfile();
  if (!profile || !isPlatformAdmin(profile) || !profile.admin_role || !can(profile.admin_role, "manage_subscriptions")) {
    return { error: "Ou pa gen dwa fè aksyon sa a." };
  }

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from("subscriptions")
    .select("status, price_htg, current_period_end, store:stores(id, name, phone)")
    .eq("id", subscriptionId)
    .maybeSingle<SubscriptionRow>();

  if (fetchError || !data) {
    return { error: "Nou pa t ka jwenn abònman sa a." };
  }

  const store = Array.isArray(data.store) ? data.store[0] : data.store;
  if (!store?.phone) {
    return { error: "Boutik la pa gen yon nimewo telefòn konfigire." };
  }

  const daysLate = computeDaysLate(data.status, data.current_period_end);
  const amountDueHtg = data.status === "suspended" || daysLate > 0 ? (data.price_htg ?? 0) : 0;
  const message =
    amountDueHtg > 0
      ? `Bonjou ${store.name}, abònman Jere Boutik ou an gen ${daysLate} jou reta. Montan pou peye: ${amountDueHtg} HTG. Tanpri peye pou evite sispansyon sèvis la.`
      : `Bonjou ${store.name}, sa se yon rapèl pou abònman Jere Boutik ou an.`;

  const phone = toE164Haiti(store.phone);
  const smsFrom = process.env.TWILIO_SMS_FROM;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

  const results = await Promise.all([
    smsFrom ? sendTwilioMessage(phone, smsFrom, message) : Promise.resolve({ ok: false, error: "TWILIO_SMS_FROM pa konfigire." }),
    whatsappFrom
      ? sendTwilioMessage(`whatsapp:${phone}`, `whatsapp:${whatsappFrom}`, message)
      : Promise.resolve({ ok: false, error: "TWILIO_WHATSAPP_FROM pa konfigire." }),
  ]);
  const [smsResult, whatsappResult] = results;
  const anySent = smsResult.ok || whatsappResult.ok;

  if (anySent) {
    await supabase.from("subscriptions").update({ last_reminder_at: new Date().toISOString() }).eq("id", subscriptionId);
  }

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    actor_role: profile.admin_role,
    action: "subscription.reminder_sent",
    resource_type: "subscription",
    resource_id: subscriptionId,
    store_id: store.id,
    metadata: {
      outcome: anySent ? "sent" : "failed",
      sms: smsResult,
      whatsapp: whatsappResult,
    },
  });

  if (!anySent) {
    return { error: `Nou pa t ka voye mesaj la (SMS: ${smsResult.error}, WhatsApp: ${whatsappResult.error}).` };
  }

  return { error: null };
}
