-- Kolòn preferans tèm (klè/fonse/sistèm) pou chak pwofil, pou yon
-- itilizatè ki konekte sou yon lòt aparèy jwenn menm preferans lan.
-- `next-themes` kenbe deja yon kopi imedyat nan `localStorage` (pa
-- aparèy) — kolòn sa a se sous verite a atravè plizyè aparèy, ekri
-- pa `src/lib/theme/updateThemePreference.ts` (Server Action ki pase
-- anba `profiles_update_self`, deja egziste, san nesesite yon nouvo
-- politik RLS).
alter table profiles
  add column theme_preference text not null default 'system'
    check (theme_preference in ('light', 'dark', 'system'));
