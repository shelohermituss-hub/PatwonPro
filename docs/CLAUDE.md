# PatwonPro — Instructions de projet

## Produit

PatwonPro est une application PWA premium de gestion de ventes, stock, crédits clients et paiements mobile money pour petites boutiques en Haïti.

L'application est principalement utilisée sur une tablette Android 10 pouces en mode paysage, résolution cible 1280 × 800.

L'interface doit paraître comme un POS fintech moderne et premium, mais rester très facile à utiliser par des commerçants non techniques.

## Utilisateurs

- owner : propriétaire de boutique, accès complet.
- employee : vendeur, accès limité aux ventes et crédits.
- platform_admin : équipe PatwonPro, gère abonnements, appareils, support et comptes.

## Stack obligatoire

- Next.js avec App Router.
- TypeScript en strict mode.
- Tailwind CSS.
- shadcn/ui.
- Icônes de contenu : pack **glassmorphism** fourni par l'utilisateur
  (SVG statiques dans `public/icons/glass/`), via un registre central
  `src/lib/icons.tsx` (une clé sémantique par concept : `Icons.product`,
  `Icons.credit`, etc.) plutôt que des imports ad-hoc par fichier. Ces
  icônes ont leurs propres couleurs fixes (pas `currentColor`) — un
  conteneur `text-*` autour ne les teinte plus, seulement le texte à
  côté. Lucide React reste utilisé pour les glyphes internes shadcn
  (chevron, coche, croix — select/dialog/sheet/calendar/command/
  checkbox/dropdown-menu/sonner) et tous les spinners `LoaderCircle`.
- Supabase PostgreSQL, Auth, Storage et Row Level Security.
- React Hook Form + Zod pour tous les formulaires.
- Dexie.js + IndexedDB pour les données offline.
- Recharts pour les graphiques.
- PWA avec manifest et service worker.

## Skills

Toujours utiliser les skills disponibles quand ils correspondent au travail :

- ui-ux-pro-max : pour toute décision UI, UX, wireframe, design system, palette, typographie, flows ou responsive design.
- frontend-design : pour créer ou améliorer les écrans et composants frontend.
- shadcn : pour installer, sélectionner ou personnaliser un composant shadcn/ui.
- improve : pour auditer et améliorer une page ou un composant existant (installé depuis `shadcn/improve`).

Avant toute nouvelle interface importante :
1. Lire `/design-system/`.
2. Inspecter les composants existants.
3. Réutiliser les tokens, patterns et composants avant d'en créer de nouveaux.
4. Présenter un bref plan de fichiers à modifier.
5. Implémenter seulement après validation du plan si le changement est important.

## Règles UI

- Langue par défaut : créole haïtien.
- Devise principale : HTG, format `12 500 HTG`.
- Aucun mot technique visible au commerçant.
- Cibles tactiles : minimum 48 × 48 px.
- Les boutons d'action critique doivent être explicites : "Konfime vant lan", "Anile", "Anrejistre".
- Ne jamais utiliser d'emoji comme icônes d'interface ; utiliser le
  registre `src/lib/icons.tsx` partout.
- Ne jamais employer un dashboard générique ou des gradients excessifs.
- Ne pas surcharger les écrans : priorité aux actions et chiffres importants.
- Éviter les modales pour les tâches longues ; utiliser un `Sheet` latéral sur tablette.
- Inclure les états loading, empty, error et offline pour chaque écran de données.
- Accessibilité : contrastes lisibles, labels, focus states et navigation clavier.

## Tokens visuels

- App background : `#F8FAFC`.
- Surface/card : `#FFFFFF`.
- Primary : `#4F46E5` (indigo-600).
- Primary hover : `#4338CA` (indigo-700).
- Primary foreground (texte sur fond primary) : `#FFFFFF`.
- Success : `#16A34A`.
- Warning : `#F59E0B`.
- Danger : `#DC2626`.
- Main text : `#0F172A`.
- Muted text : `#64748B`.
- Border : `#E2E8F0`.
- Radius large : 16px.
- Radius medium : 12px.
- Sidebar tablette : 248px.
- Font : Geist (préset shadcn "Nova" — voir `components.json`).
- Dégradé de marque (usage réservé — logo, panneau héro auth, jamais un
  fond de composant par défaut) : `#4F46E5` → `#7C3AED` → `#06B6D4`.
- Point d'accent de marque (très ponctuel) : `#FACC15`.

## Modules produit

1. Page d'accueil publique (landing page, `/` — non authentifiée).
2. Tableau de bord.
3. Point de vente : ventes cash, MonCash, NatCash, crédit.
4. Produits et stock (avec photo de pwodwi, optionnelle).
5. Entrées de stock et ajustements.
6. Crédits clients et remboursements.
7. Rapports.
8. Paramètres de boutique et employés (profil boutique éditable + logo).
9. Abonnement, tablettes et support.
10. Synchronisation offline-first.
11. Back-office interne **Jere Boutik Admin** (`/admin`, équipe
    PatwonPro uniquement — gestion boutiques, leads/essais, abonnements,
    cautions, tablettes, installations terrain, support, transactions,
    sync, analytique, équipe et journal d'audit). Complètement séparé de
    l'interface commerçant, sidebar sombre dédiée. Voir
    `docs/ADMIN_DASHBOARD_ARCHITECTURE.md` — phase 1 actuelle est UI +
    données mockées, sans connexion Supabase/MonCash/NatCash.

## Architecture offline

- Toute action métier doit d'abord être persistée dans IndexedDB.
- Ajouter ensuite une opération à la sync queue.
- Synchroniser avec Supabase au retour du réseau.
- Les ventes cash doivent fonctionner entièrement hors ligne.
- Les paiements MonCash et NatCash ne doivent être confirmés qu'après webhook serveur validé.
- Afficher constamment l'état réseau et sync :
  - Online · Synced il y a X min.
  - Offline · X actions en attente.
  - Syncing · X actions en cours.

## Paiements

- Ne jamais marquer un paiement MonCash ou NatCash comme payé à partir du frontend seul.
- Les confirmations viennent d'une vérification côté serveur (`GET /api/payments/status/[id]`,
  qui interroge le gateway de paiement) — celui-ci ne documente aucun webhook/IPN,
  le "poll" est donc le mécanisme de confirmation, pas un repli.
- Stocker le provider, le transaction ID, le montant, le statut, les timestamps et l'événement brut sécurisé.
- Prévoir les états `pending`, `paid`, `failed`, `cancelled`, `expired`.

## Convention de code

- Composants : PascalCase.
- Hooks : `useXxx`.
- Schémas Zod : `xxxSchema`.
- Tables Supabase : snake_case.
- Routes API : kebab-case.
- Toutes les dates sont stockées UTC, puis affichées dans le fuseau local.
- Ajouter des commentaires uniquement pour documenter une décision complexe.
- Écrire des composants petits et réutilisables.
- Ne pas utiliser `any`.
- Exécuter lint et typecheck avant de considérer une tâche terminée.

## Définition of done

Une tâche est terminée seulement si :
1. Elle respecte le design system ZIP.
2. Les états loading, error et empty existent.
3. Les formulaires valident avec Zod.
4. Les types TypeScript sont corrects.
5. `npm run lint` passe.
6. `npm run typecheck` passe.
7. Le comportement tablette 1280 × 800 a été vérifié.
8. Les textes sont en créole haïtien.
