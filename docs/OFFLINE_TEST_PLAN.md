# Plan de Test — Offline-First

Procédure manuelle pour vérifier que l'offline-first fonctionne
réellement de bout en bout. À rejouer après tout changement touchant
`src/lib/db/`, `src/lib/sync/`, ou `public/sw.js`.

## Prérequis

- App déployée (HTTPS) ou `npm run build && npm run start` en local
  (le service worker ne s'enregistre qu'en production — voir
  `ServiceWorkerRegister.tsx`).
- Un compte `owner` avec au moins 2-3 produits déjà en stock.
- Chrome DevTools → onglet **Network** → case **Offline**, ou
  **Application → Service Workers → Offline** pour un test plus
  réaliste (coupe vraiment le réseau, pas juste les requêtes fetch).

## 1. App shell — ouverture hors ligne

1. Visiter `/dashboard`, `/products`, `/sales/new`, `/credits` en ligne
   une première fois (pour que le SW mette le shell en cache — voir
   `APP_SHELL_FALLBACK_KEY` dans `docs/OFFLINE_FIRST_ARCH.md`).
2. Couper le réseau (DevTools Offline).
3. Recharger complètement une page **jamais visitée en rechargement
   complet** (ex. naviguer vers `/reports` puis faire un hard refresh,
   ou fermer/rouvrir l'onglet sur cette URL).
4. **Attendu** : l'app s'ouvre sur le shell authentifié (sidebar +
   contenu Dexie), **pas** sur la landing page publique `/`. Si `/` ou
   `/login` apparaît, le fallback du service worker a régressé.

## 2. Vente cash entièrement hors ligne

1. Réseau coupé, aller sur `/sales/new`.
2. Ajouter 2-3 produits au panier, payer en cash, confirmer.
3. **Attendu** : "Vant konplete" s'affiche immédiatement, le stock du
   produit diminue visuellement, `SyncStatusBadge` passe à
   "Offline · X aksyon" (X ≥ 1).
4. Recharger `/sales` (historique) — la vente doit apparaître
   immédiatement (lue depuis Dexie).

## 3. Produit + entrée de stock hors ligne

1. Toujours hors ligne, créer un nouveau produit (`/products/new`).
2. Créer une entrée de stock (`/stock-entries/new`) sur un produit
   existant (type "Restock", quantité positive).
3. **Attendu** : les deux apparaissent immédiatement dans leurs listes
   respectives ; `SyncStatusBadge` reflète le nombre total d'actions en
   attente (vente + produit + entrée de stock).

## 4. Crédit + remboursement hors ligne

1. Toujours hors ligne, créer une vente à crédit (`/credits/new`) pour
   un client existant.
2. Enregistrer un remboursement partiel sur ce crédit
   (`/credits/[id]`).
3. **Attendu** : le solde du crédit se met à jour immédiatement à
   l'écran (calcul local), les deux actions comptent dans
   `SyncStatusBadge`.

## 5. Paiement mobile désactivé hors ligne

1. Toujours hors ligne, aller sur `/sales/new`, ajouter un produit au
   panier.
2. Observer les boutons "MonCash"/"NatCash" dans le sélecteur de
   paiement.
3. **Attendu** : les deux boutons sont désactivés (grisés) ; si l'un
   était déjà sélectionné avant la coupure, un message "X mande
   koneksyon — eseye kach oswa kredi pou kounye a" apparaît et le
   bouton "Peye" reste désactivé. Cash et Kredi restent utilisables
   normalement.

## 6. Dashboard — bandeau offline

1. Toujours hors ligne, aller sur `/dashboard`.
2. **Attendu** : un bandeau "Done sa yo ka pa ajou — ou offline"
   apparaît en haut de la page, au-dessus des KPI (qui affichent les
   derniers chiffres connus, potentiellement figés).
3. Réactiver le réseau, recharger — le bandeau disparaît.

## 7. Reconnexion — synchronisation complète

1. Réactiver le réseau (DevTools Online).
2. **Attendu**, sans action manuelle :
   - `SyncStatusBadge` passe à "Ap senkwonize" puis, sous quelques
     secondes, "Anliy · senkwonize" (0 action en attente).
   - Le bandeau offline du dashboard disparaît au prochain chargement.
3. Vérifier côté serveur (Supabase Table Editor ou
   `mcp__Supabase__execute_sql`) que la vente cash, le produit,
   l'entrée de stock, le crédit et le remboursement créés aux étapes
   2-4 sont bien présents avec les bonnes valeurs.

## 8. Non-régression — accès direct à une page jamais visitée

Rejoue l'étape 1 avec une page encore différente (ex. `/settings`) pour
confirmer que le fallback n'est pas spécifique à une seule route.

## Limite connue de cet environnement

Les étapes ci-dessus n'ont **pas** pu être rejouées avec un navigateur
réel dans cette session — le navigateur headless sandboxé ne peut pas
compléter une connexion Supabase authentifiée à travers le proxy de cet
environnement (limite déjà documentée dans une session précédente). Le
fix du fallback service worker (étape 1) avait été vérifié ainsi lors
de sa correction initiale ; les étapes 2-7 restent à rejouer
manuellement après déploiement.
