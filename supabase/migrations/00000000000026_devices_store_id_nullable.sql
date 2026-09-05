-- `devices` te egzije `store_id`/`name` obligatwa depi kòmansman (migration
-- 001), sa ki te fè sans lè sèl chemen kreyasyon te "ajoute yon tablèt pou
-- BOUTIK sa a". Modèl envantè admin la ("Aparèy") mande pou tablèt ka
-- egziste `in_stock`/`reserved` AVAN yo asiyen a yon boutik. Pa gen okenn
-- kòd aplikasyon ki ekri `devices` jodi a (grep konfime) — se travay
-- admin sèlman pral kreye/asiyen tablèt yo, kidonk sa a san risk.

alter table devices alter column store_id drop not null;
alter table devices alter column name drop not null;
