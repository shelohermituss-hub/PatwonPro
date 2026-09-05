-- Vizibilite sync reyèl san sou-jenyeri : reyitilize `devices.last_seen_at`
-- (deja la, jamè mete ajou) + de nouvo chan senp. Ranpli pa
-- `POST /api/sync/heartbeat`, apèle nan `syncAllPending()` bò kliyan an.

alter table devices
  add column pending_actions integer not null default 0,
  add column sync_errors integer not null default 0;
