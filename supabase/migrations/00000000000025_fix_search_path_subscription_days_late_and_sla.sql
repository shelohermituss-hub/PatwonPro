-- Korije 2 fonksyon ki te kreye san `set search_path = public` (kontrèman
-- ak konvansyon etabli depi 000004) — `mcp__Supabase__get_advisors` te
-- rapòte 2 alèt `function_search_path_mutable` apre migrasyon 014/017.

alter function subscription_days_late(subscriptions) set search_path = public;
alter function set_support_ticket_sla() set search_path = public;
