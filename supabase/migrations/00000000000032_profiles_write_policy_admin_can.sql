-- `profiles_all_platform_admin` (migration 001) se yon FOR ALL laj —
-- `is_platform_admin()` sèlman. Sa te nesesè pou platform_admin jere
-- pwofil kòmèsan (owner/employee) pou sipò kliyan — konpòtman sa a
-- rete EGZAKTEMAN menm jan pou pwofil kòmèsan yo. Men modifye pwofil
-- yon LÒT platform_admin (chanje non l, retire l de yon boutik, elt.)
-- se yon aksyon ki dwe rezève a `manage_team` sèlman, menm jan ke
-- migrasyon 028 deja fè l pou kolòn `admin_role` la espesifikman.
--
-- Enpòtan : trigger `enforce_admin_role_change` (migration 028) rete
-- SAN CHANJE — li kouvri yon twou diferan ke policy sa a pa ka kouvri.
-- `profiles_update_self` ("for update using (id = auth.uid())", san
-- WITH CHECK eksplisit) se yon policy pèmisiv SEPARE ki ta kite yon
-- admin chanje pwòp `admin_role` LI MENM san policy sa a pa janm wè
-- sa (paske `role <> 'platform_admin'` fo pou LI MENM tou, e li ta ka
-- pase kanmenm si nou pa gen trigger la). Konsa de mekanis yo konplete
-- youn ak lòt, yo pa fè menm travay de fwa : policy sa a bloke "admin
-- A modifye pwofil admin B" ; trigger 028 bloke "admin A ogmante pwòp
-- `admin_role` pa li".

alter policy profiles_all_platform_admin on profiles
  using (is_platform_admin() and (role <> 'platform_admin' or admin_can('manage_team')))
  with check (is_platform_admin() and (role <> 'platform_admin' or admin_can('manage_team')));
