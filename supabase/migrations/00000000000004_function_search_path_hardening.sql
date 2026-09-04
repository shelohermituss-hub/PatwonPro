-- Fikse `search_path` sou fonksyon ki pa t gen li (Supabase security
-- advisor: "Function Search Path Mutable") — san sa, yon itilizatè ki ka
-- kreye objè nan yon lòt schema ka "shadow" yon tab/fonksyon fonksyon an
-- rele san kalifye l (attaque search_path). `is_platform_admin()` ak
-- `register_owner()` deja gen `set search_path = public` depi kreyasyon
-- yo — sèl 3 fonksyon sa yo te manke l.

alter function set_updated_at() set search_path = public;
alter function apply_credit_sale_balance() set search_path = public;
alter function apply_credit_payment_balance() set search_path = public;
