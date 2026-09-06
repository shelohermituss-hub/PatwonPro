-- Pèmèt `/admin/sync` "Relanse Sync" mande yon resenkwonizasyon reyèl:
-- admin ekri yon nouvo timestamp isit la, `POST /api/sync/heartbeat`
-- (apèl ke boutik la deja fè regilyèman) renvoye l nan repons lan, e
-- `src/lib/sync/index.ts` fòse yon `syncAllPending()` imedya si l pi
-- resan pase dènye fwa li te trete. Pa gen nouvo policy RLS
-- nesesè — ekriti deja kouvri pa `devices_write_platform_admin`/
-- `devices_update_platform_admin` (admin_can('manage_devices'),
-- migration 016), lekti deja kouvri pa `devices_select_member`.

alter table devices add column resync_requested_at timestamptz;
