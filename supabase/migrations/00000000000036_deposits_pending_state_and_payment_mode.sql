-- Jiska kounye a, yon liy `deposits` te toujou vle di "lajan an deja
-- antre" (`status` defo `received`) — kreye pa men pa yon admin apre
-- kòb la fizikman resevwa. Pou konekte asiyasyon yon tablèt ak yon
-- kosyon reyèlman peyabl pa kòmèsan an (pwochen migrasyon ak sèvè
-- aksyon peman), nou bezwen yon eta anvan sa a: kosyon an kreye, men
-- poko peye ditou. `pending` vin premye etap nan sik la, `received`
-- rete "lajan an antre" (antyèman oswa apre yon peman konfime).
--
-- `amount_htg` rete objektif total la; `amount_paid_htg` swiv sa ki
-- deja antre (enkremante pa aksyon sèvè apre chak peman gateway
-- konfime). `payment_mode`/`monthly_installment_htg` anrejistre chwa
-- admin te fè lè li t ap asiyen tablèt la (yon fwa sèlman, oswa yon
-- mansyalite fiks chak mwa).

alter table deposits
  drop constraint deposits_status_check,
  add constraint deposits_status_check check (status in (
    'pending', 'received', 'held', 'eligible_for_refund', 'refund_requested',
    'refunded', 'partially_retained', 'fully_retained'
  ));

alter table deposits
  alter column status set default 'pending',
  add column amount_paid_htg numeric(12, 2) not null default 0,
  add column payment_mode text not null default 'lump_sum' check (
    payment_mode in ('lump_sum', 'monthly_installment')
  ),
  add column monthly_installment_htg numeric(12, 2);

-- Sèl aksè lekti kòmèsan te manke — ekriti rete antyèman rezève pou
-- admin (`deposits_write_admin`, egzistan), kòmèsan pa janm ekri
-- dirèkteman nan `deposits`, sèlman atravè efè yon peman gateway
-- konfime (sèvè aksyon ak createAdminClient()). Additive — pa manyen
-- `deposits_select_admin` egzistan.
create policy deposits_select_member on deposits
  for select using (store_id = my_store_id());
