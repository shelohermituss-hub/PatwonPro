-- Anrichi `support_tickets` ak chan back-office (kategori/priyorite/ajan
-- asiyen/SLA). Estati rete enchanje (`open|in_progress|resolved|closed`) —
-- Kanban admin sèvi ak 4 vrè valè sa yo, pa 4 lòt etikèt.
--
-- Separe politik "FOR ALL" ki te la a an kat: manm boutik ka toujou kreye/li
-- pwòp tikè yo, men se sèlman platform_admin (ak `admin_can('manage_support')`)
-- ki ka modifye/efase — okenn fonksyonalite "modifye tikè" pa t egziste bò
-- kòmèsan de tout fason.

alter table support_tickets
  add column category text check (category in (
    'training', 'products_stock', 'pos_sale', 'customer_credit',
    'device_hardware', 'connectivity_sync', 'moncash_natcash',
    'subscription', 'feature_suggestion'
  )),
  add column priority text not null default 'P3' check (priority in ('P1', 'P2', 'P3', 'P4')),
  add column assigned_agent_id uuid references profiles(id) on delete set null,
  add column sla_deadline timestamptz;

create function set_support_ticket_sla()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.sla_deadline := new.created_at + case new.priority
    when 'P1' then interval '1 day'
    when 'P2' then interval '1 day'
    when 'P3' then interval '2 days'
    else interval '30 days'
  end;
  return new;
end;
$$;

create trigger support_tickets_set_sla
  before insert on support_tickets
  for each row
  execute function set_support_ticket_sla();

update support_tickets
set sla_deadline = created_at + case priority
  when 'P1' then interval '1 day'
  when 'P2' then interval '1 day'
  when 'P3' then interval '2 days'
  else interval '30 days'
end
where sla_deadline is null;

drop policy support_tickets_store_isolation on support_tickets;

create policy support_tickets_select on support_tickets
  for select using (store_id = my_store_id() or is_platform_admin());
create policy support_tickets_insert on support_tickets
  for insert with check (store_id = my_store_id() or is_platform_admin());
create policy support_tickets_update_admin on support_tickets
  for update using (is_platform_admin() and admin_can('manage_support'));
create policy support_tickets_delete_admin on support_tickets
  for delete using (is_platform_admin() and admin_can('manage_support'));
