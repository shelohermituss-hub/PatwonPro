# Notifikasyon Push — Architecture

Web Push standard (VAPID, W3C Push API) — pas Firebase/OneSignal, aucun
compte tiers, réutilise `public/sw.js` déjà en place.

## Limite technique (à connaître avant de tester)

- **Android** : fonctionne dans Chrome, PWA installée ou onglet normal.
- **iOS/iPadOS Safari ≥16.4** : fonctionne **uniquement** si la PWA a
  été ajoutée à l'écran d'accueil — un onglet Safari normal ne reçoit
  jamais de push, c'est une limite d'Apple, pas de ce code.
- **Web Push exige HTTPS** (sauf `localhost` en dev desktop) — un push
  réel ne peut pas être testé sur un domaine de preview sans certificat
  valide, ni depuis cet environnement sandboxé (pas de navigateur réel
  ni de domaine public joignable ici).

## Génération des clés VAPID (déjà faite pour ce projet)

```
npx web-push generate-vapid-keys --json
```

Résultat stocké dans `.env.local` (jamais commité) :
`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Un
`PUSH_DISPATCH_SECRET` (chaîne aléatoire, `openssl rand -hex 32`) a
aussi été généré — c'est le secret partagé entre `pg_cron`/`pg_net` et
`POST /api/push/dispatch` (voir plus bas), pas un secret VAPID. **Ces
valeurs doivent être configurées séparément sur l'environnement de
production (Vercel, etc.)** — `.env.local` ne voyage pas avec le déploiement.

## Schéma (migrations 040-043)

- **`push_subscriptions`** — un abonnement navigateur par appareil
  (`profile_id`, `endpoint` unique, `p256dh`/`auth`). RLS : le
  propriétaire ou `platform_admin`.
- **`notification_preferences`** — un switch par catégorie et par
  profil (`subscription_reminders`, `low_stock`, `credit_overdue`,
  `sync_errors`, `new_sales` — ce dernier désactivé par défaut). Même RLS.
- **`notification_logs`** — append-only, un log par tentative
  d'envoi (succès/échec), lu depuis l'onglet "Notifikasyon" de
  `/settings`/`/admin/settings`.
- **`notification_campaigns`** — la console admin (voir plus bas).
  Cible `target_scope` (`all_stores`/`single_user`/`admin_team`) +
  `target_profile_id` (migration 043 — cherche/vise n'importe quel
  profil par nom, pas seulement une boutique), et un `notification_type`
  (`info`/`success`/`warning`/`urgent`) affiché comme badge dans la
  console.
- `pg_cron`/`pg_net` activés (migration 042) — déclenchent `POST
  /api/push/dispatch` via `net.http_post`, jamais de session Supabase,
  authentifié par `x-push-dispatch-secret`.

## Envoi (`src/lib/push/send.ts`)

- `sendPushToProfile(profileId, {category, title, body, url})` :
  vérifie `notification_preferences` (sauf `admin_broadcast`, jamais
  filtré — c'est une annonce ponctuelle, pas une alerte récurrente),
  envoie à chaque abonnement du profil via `web-push`, retire
  l'abonnement s'il répond 404/410 (expiré), log systématiquement dans
  `notification_logs`. Utilise toujours `createAdminClient()` (service
  role) — appelé depuis des contextes sans session admin du tout (le
  heartbeat sous la session d'un employé, ou `pg_cron` sans session).
- `sendPushToProfileBulk(profileIds, payload)` — même chose pour
  plusieurs profils (campagnes admin, alertes stock/crédit).

## Déclencheurs déjà branchés

| Catégorie | Déclenché depuis |
|---|---|
| `subscription_reminder` | `sendSubscriptionReminder.ts` (en plus du SMS/WhatsApp Twilio existant) |
| `sync_error` | `POST /api/sync/heartbeat`, quand `errorCount` ≥ 3 |
| `low_stock` / `credit_overdue` | `POST /api/push/dispatch` (`kind: "scheduled_alerts"`), cron quotidien 8h |
| `admin_broadcast` | Console admin `/admin/notifications` (voir plus bas) |
| `new_sale` / `refund` | Colonne de préférence prête (`new_sales`), **aucun déclencheur câblé** — hors périmètre de ce chantier, laissé pour une itération future si le besoin se confirme |

## Console admin — gestion des notifications (`/admin/notifications`)

Demande explicite de l'utilisateur : créer, ajouter un déclencheur,
supprimer — complet. Système de **campagnes**, distinct des alertes
automatiques ci-dessus.

- **Modèles prédéfinis** (`src/lib/admin/notificationTemplates.ts`) :
  ~15 modèles liés à de vraies actions du produit (nouvelle vente,
  crédit en retard, stock bas, changement de statut d'abonnement,
  caution reçue/remboursée, demande de remplacement approuvée/rejetée,
  ticket support créé/résolu, erreur de sync, maintenance...) —
  sélectionner un modèle dans le Sheet préremplit Kalite/Tit/Mesaj/
  Kategori, l'admin peut ensuite ajuster librement avant d'envoyer.
- **Créer** : `NewNotificationCampaignSheet` — modèle (optionnel),
  destinataire (une boutique/un utilisateur précis, cherché par nom /
  toutes les boutiques / l'équipe admin), kalite (Info/Siksè/
  Avètisman/Ijans), titre, message, déclencheur (voir ci-dessous).
  `createNotificationCampaign` (Server Action,
  `src/lib/admin/actions/notificationCampaigns.ts`) — insère la ligne,
  puis :
  - **Voye kounye a (immediate)** : dispatch synchrone
    (`dispatchNotificationCampaign`), statut `sent` immédiatement.
  - **Pwograme yon dat (scheduled_once)** : traduit en une expression
    cron "à un instant précis" (minute/heure/jour/mois exacts),
    enregistrée via `cron.schedule` (RPC `schedule_notification_campaign_cron`) ;
    se désenregistre automatiquement après son unique envoi.
  - **Repete (recurring)** : sélecteur simplifié
    (quotidien/hebdomadaire/mensuel + heure) traduit en cron standard
    côté client (`toRecurringCronExpression`) — l'admin ne voit/écrit
    jamais de syntaxe cron brute.
- **Supprimer** : `deleteNotificationCampaign` — efface la ligne et
  désenregistre le job `pg_cron` associé s'il y en a un
  (`unschedule_notification_campaign_cron`), donc une suppression
  arrête vraiment les envois futurs.
- **URL de dispatch auto-détectée** : `createNotificationCampaign`
  construit l'URL `POST /api/push/dispatch` à partir de l'en-tête
  `host` de la requête elle-même (même technique que
  `resetOwnerPassword.ts`) — aucune configuration manuelle de domaine
  nécessaire, fonctionne dès le déploiement.
- **Alertes quotidiennes auto-réparées** : `ensureScheduledAlertsCron`
  (re)programme le job `daily_notification_alerts` à chaque chargement
  de `/admin/notifications`, avec l'URL courante — survit à un
  changement de domaine/redéploiement sans étape manuelle.
- **Permission** : nouvelle action `manage_notifications`
  (`super_admin` et `operations_manager`), RLS
  `is_platform_admin() and admin_can('manage_notifications')` sur
  `notification_campaigns`.

## UI préférences (commerçant + admin)

Onglet "Notifikasyon" dans `/settings` et carte "Notifikasyon" dans
`/admin/settings` (`NotificationPreferencesForm.tsx`) : bouton "Aktive"
(demande la permission navigateur — jamais un prompt à froid, un écran
d'explication d'abord via `NotificationPermissionPrompt.tsx`, patron
`InstallPrompt.tsx`), un switch par catégorie, historique des 20
dernières notifications.

## Ce qui nécessite une action externe

- **Configurer `NEXT_PUBLIC_VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/
  `VAPID_SUBJECT`/`PUSH_DISPATCH_SECRET` sur l'environnement de
  production** (Vercel ou équivalent) — générés localement, jamais commités.
- **Test réel sur appareil** : nécessite un déploiement HTTPS public +
  un vrai téléphone Android/iPhone — impossible à vérifier depuis cet
  environnement sandboxé. Après déploiement : ouvrir l'app, accepter la
  permission, déclencher un rappel d'abonnement ou une campagne
  "immédiate" depuis `/admin/notifications`, confirmer la réception.
- **`pg_cron`/`pg_net`** : déjà activés sur le projet Supabase de ce
  repo (vérifié via `mcp__Supabase__list_extensions`) — rien à faire de
  plus, `ensureScheduledAlertsCron` s'auto-configure au premier
  chargement de `/admin/notifications` après déploiement.
