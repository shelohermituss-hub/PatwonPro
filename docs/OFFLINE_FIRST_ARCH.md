# Architecture Offline-First

État réel de l'offline-first à PatwonPro — ce qui existe, comment ça
marche, ce qui est volontairement hors périmètre.

## Contexte

Un signalement utilisateur ("l'offline ne marche pas vraiment — ça me
retourne sur la landing page") a déclenché un audit complet plutôt
qu'une reconstruction supposée nécessaire. Verdict : **la fondation
offline-first est déjà largement construite et solide** — le seul bug
concret trouvé était dans le service worker (fallback de navigation
hors ligne qui retombait sur `/` au lieu du dernier shell authentifié
en cache), déjà corrigé. Ce document et ce chantier couvrent la
vérification, deux vrais trous comblés, et la documentation qui
manquait.

## Stockage local — Dexie (IndexedDB)

`src/lib/db/index.ts`, schéma versionné (v1→v4) :

| Table | Contenu | Index clé |
|---|---|---|
| `products` | Catalogue produits (miroir local) | `store_id, category_id, name, sku, is_active, sync_status` |
| `categories` | Catégories produits | — (peu de volume, pas de sync propre, rafraîchi via `pullProducts`) |
| `customers` | Clients (miroir local, lecture POS/crédits) | pull-only, jamais écrit localement en pending |
| `sales` + `saleItems` | Ventes + lignes de vente | `store_id, customer_id, sync_status, created_at` |
| `creditPayments` | Remboursements de crédit | `store_id, customer_id, sale_id, sync_status, created_at` |
| `stockEntries` | Entrées/corrections/ajustements de stock | `store_id, product_id, sync_status, created_at` |

Chaque ligne créée offline porte `sync_status: "pending"` (pas de table
`sync_queue` séparée — le statut vit sur la ligne elle-même, décision
délibérée pour ne pas reconstruire l'architecture la plus critique et
déjà fonctionnelle de l'app). Une vente cash fonctionne à 100% hors
ligne : écriture Dexie immédiate, décrémentation de stock locale pour
le feedback UI, aucune dépendance réseau dans le chemin critique.

## Moteur de synchronisation

`src/lib/sync/{sales,products,customers,creditPayments,stockEntries}.ts`
— un module par table :
- **Push** (`syncPendingX()`) : lit les lignes `sync_status: "pending"`,
  les pousse vers Supabase (`upsert` sur la clé primaire), marque
  `"synced"` en cas de succès. Backoff exponentiel avec jitter
  (`src/lib/sync/backoff.ts`, base 5s, plafond 5 min) sur échec —
  jamais de boucle de retry agressive qui viderait la batterie/données
  mobiles.
- **Pull** (`pullX(storeId)`) : rafraîchit le miroir local depuis
  Supabase, appelé au chargement des pages qui en ont besoin
  (`/sales/new` → `pullProducts`+`pullCustomers`, `/credits` →
  `pullCustomers`+`pullCreditPayments`, `/stock-entries` →
  `pullProducts`+`pullStockEntries`, `/products` → `pullProducts`,
  `CategoriesManager`/`StockEntryForm` → `pullProducts` après
  modification de catégorie).
- **Déclenchement** : `registerSyncListeners()`
  (`src/lib/sync/index.ts`), appelé une fois depuis
  `SyncStatusBadge.tsx` (monté dans la sidebar sur chaque page
  authentifiée) — écoute l'événement `online` + une boucle
  d'arrière-plan (`BACKGROUND_INTERVAL_MS`) qui retente les lignes en
  attente même sans transition `online` explicite (utile pour le
  backoff).
- **Heartbeat** : `POST /api/sync/heartbeat`, appelé à la fin de chaque
  `syncAllPending()` — remonte `pendingCount`/`errorCount` pour
  `/admin/sync`, et relance une synchronisation immédiate si un admin a
  déclenché "Relanse Sync" (`resyncRequestedAt`).

## Stratégie de conflit

**Dernier push local gagne** — chaque `syncPendingX()` fait un `upsert`
sur la clé primaire sans comparer d'horodatage avec l'état déjà présent
côté serveur. Choix assumé, pas une omission : le cas réel (deux
appareils modifiant la même ligne hors ligne simultanément) est rare
dans ce contexte (une tablette par boutique dans l'immense majorité des
cas) et le coût d'un vrai merge/détection de conflit ne se justifie pas
ici. Si ce cas devient un problème réel, la prochaine étape serait de
comparer un `updated_at` local vs serveur avant l'`upsert` plutôt que
de l'écraser aveuglément — non implémenté.

## État réseau — UI

- `src/hooks/useOnlineStatus.ts` — `navigator.onLine` + événements
  `online`/`offline` via `useSyncExternalStore`.
- `src/hooks/usePendingSyncSummary.ts` — compte les lignes `pending`
  toutes tables confondues.
- `src/components/SyncStatusBadge.tsx` — les 3 états exacts déjà
  demandés : **Anliy · senkwonize** / **Ap senkwonize** / **Offline ·
  X aksyon**. Affiché en permanence dans la sidebar.
- **`/dashboard` (nouveau, ce chantier)** — seule page du groupe
  `(dashboard)` qui lit Supabase directement (Server Component, pas
  Dexie, pour ses agrégats). Hors ligne, le service worker sert le
  dernier HTML en cache avec des chiffres potentiellement figés, sans
  indication — `DashboardOfflineBanner.tsx` (client, `useOnlineStatus`)
  affiche maintenant un bandeau explicite ("Done sa yo ka pa ajou — ou
  offline") quand `navigator.onLine` est faux.
- **Paiement mobile POS (nouveau, ce chantier)** — `useStorePaymentConfig`
  fait un simple fetch client (pas de miroir Dexie, config rarement
  modifiée) ; hors ligne, le QR/numéro ne peut pas être garanti à jour.
  `CartPanel.tsx` désactive maintenant les boutons MonCash/NatCash
  (et bloque le checkout si l'un était déjà sélectionné) quand
  `useOnlineStatus()` est faux, avec le message "X mande koneksyon —
  eseye kach oswa kredi pou kounye a" (`docs/UI_RULES.md` §4).

## Service worker (`public/sw.js`)

Cache uniquement l'app shell (HTML) et les assets statiques — jamais
les réponses Supabase/API (Dexie est déjà la source de vérité pour les
données offline). Fallback de navigation hors ligne, dans l'ordre :
1. Cette URL exacte si elle a déjà été visitée en navigation complète.
2. `APP_SHELL_FALLBACK_KEY` — le dernier shell **authentifié** visité
   avec succès (corrige le bug historique : sans ça, une route jamais
   visitée en rechargement complet — la norme avec la navigation
   client-side de Next.js — retombait sur `/`, la landing publique).
3. `/` en dernier recours pour un visiteur jamais connecté.

## Hors périmètre, volontairement

- **Rapports** (`/reports`) : lecture Supabase directe pour les
  agrégats, pas de miroir Dexie — source de vérité unique pour des
  calculs qui doivent rester exacts. Affiche un état dédié si hors
  ligne (déjà en place, `docs/PROMPTS/08-pwa.md`).
- **MonCash/NatCash comme "paiement confirmé par webhook"** : cette
  architecture n'a **jamais** utilisé d'API/webhook de paiement au
  POS (`docs/CLAUDE.md` — Paiements) — le client paie directement dans
  le compte mobile money de la boutique, le caissier confirme
  manuellement après vérification sur son propre téléphone. La
  distinction classique "vente offline vs paiement webhook confirmé"
  ne s'applique donc pas ici ; seule la disponibilité du QR/numéro
  (ci-dessus) dépend du réseau.
- **Détection de conflit avec merge réel** : voir "Stratégie de
  conflit" ci-dessus.
