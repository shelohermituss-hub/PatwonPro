# Mode Dark

Mécanisme, tokens et règles du mode sombre — commerçant (`(dashboard)`)
et admin (`(admin)`). La landing (`/`) et les écrans non authentifiés
(`/login`, `/register`, `/accept-invite`, `/onboarding`) restent
**toujours** en thème clair, quel que soit le réglage système ou le
choix précédent de l'utilisateur.

## Mécanisme

- **`next-themes`**, monté une seule fois : `AppThemeProvider`
  (`src/components/AppThemeProvider.tsx`), rendu dans
  `src/app/layout.tsx` (le layout racine, pas dans `(dashboard)`/
  `(admin)` séparément).
  - **Pourquoi un seul provider, à la racine** : dans cette version de
    `next-themes`, un `<ThemeProvider>` imbriqué sous un provider déjà
    monté ne fait *rien* (il se contente de rendre ses enfants dans un
    `Fragment`, `forcedTheme` y compris) — donc "un provider dans
    `(dashboard)/layout.tsx` et un autre dans `(admin)/layout.tsx`,
    aucun à la racine" n'aurait pas marché. Et un seul provider mais
    scoppé à un sous-arbre (sans rien à la racine) laisserait la classe
    `.dark` collée sur `<html>` après une navigation client-side vers
    `/login` — `next-themes` n'a pas d'effet de nettoyage au démontage.
    Un seul provider permanent à la racine, avec un `forcedTheme`
    recalculé à chaque changement de route via `usePathname()`, évite
    les deux problèmes.
  - `attribute="class"`, `defaultTheme="system"`, `enableSystem`.
  - `forcedTheme="light"` quand le chemin est `/`, ou commence par
    `/login`, `/register`, `/accept-invite`, `/onboarding` — sinon
    `undefined` (thème réel appliqué).
  - `<html suppressHydrationWarning>` dans `src/app/layout.tsx` (requis
    par `next-themes` — le script anti-flash injecté par la librairie
    fixe la classe avant hydration, donc le HTML serveur et le premier
    rendu client diffèrent légitimement une fois).
- **Toggle** : `src/components/ThemeToggle.tsx` — 3 boutons
  Klè/Fonse/Sistèm (`Sun`/`Moon`/`Monitor`, Lucide), branché sur
  `useTheme()`. Utilisé dans l'onglet "Aparans" de
  `(dashboard)/settings/page.tsx` et dans une carte "Aparans" de
  `(admin)/admin/settings/SettingsClient.tsx` (jamais soumis à
  `can(actor.role, "manage_settings")` — c'est une préférence
  personnelle par session, pas un réglage plateforme).
- **Persistance** :
  - **Par appareil, immédiate** : `next-themes` écrit déjà dans
    `localStorage` (clé `theme`) à chaque `setTheme()` — fonctionne
    même hors ligne.
  - **Par compte, cross-device** : colonne `profiles.theme_preference`
    (migration `00000000000039_profiles_theme_preference.sql`,
    `'light' | 'dark' | 'system'`, défaut `'system'`). Écrite en
    best-effort par `src/lib/theme/updateThemePreference.ts` (Server
    Action, passe par la policy `profiles_update_self` déjà existante —
    aucune nouvelle policy RLS nécessaire) à chaque clic sur le toggle.
    Un échec (hors ligne) est silencieux : l'appareil courant a déjà le
    bon thème via `localStorage`, le prochain changement en ligne
    resynchronise le profil.
  - **Application au premier chargement d'un nouvel appareil** :
    `src/components/ThemeSync.tsx`, monté dans `(dashboard)/layout.tsx`
    et `(admin)/layout.tsx` — au montage, si `localStorage.theme`
    n'existe pas encore sur cet appareil, applique
    `profile.theme_preference`. N'écrase jamais un choix déjà fait sur
    cet appareil.

## Tokens ajustés en `.dark` (`src/app/globals.css`)

Le bloc `.dark` existait déjà (scaffold `shadcn init`, jamais branché
avant ce chantier). Deux tokens ont été **mesurés** (ratio de contraste
WCAG par luminance relative, pas estimés à l'œil) contre le nouveau
fond sombre `--background: oklch(0.145 0 0)` et corrigés :

| Token | `:root` (clair) | `.dark` avant | Contraste avant | `.dark` après | Contraste après |
|---|---|---|---|---|---|
| `--text-secondary` | `#64748b` | *(hérité, non redéfini)* | ~4.16:1 | `#94a3b8` | ~7.7:1 |
| `--danger` / `--destructive` | `#dc2626` | `#dc2626` *(identique)* | ~4.10:1 | `#ef4444` | ~5.3:1 |

Les deux échouaient sous le seuil AA (4.5:1) pour du texte normal.
`--warning` (`#f59e0b`) et `--success` (`#16a34a`) ont aussi été
mesurés et restent inchangés — déjà au-dessus de 6:1 sur le fond sombre.

`--chart-1..5` restent des tokens shadcn scaffold **non utilisés** dans
ce projet (les graphiques Recharts — `SalesTrendChart`,
`PaymentBreakdownChart` — dessinent avec `var(--primary)` directement,
pas `--chart-*`) — non modifiés, aucun rendu réel n'en dépend.

## Zones volontairement toujours claires

- **Landing (`/`)** et **écrans auth** (`/login`, `/register`,
  `/accept-invite`, `/onboarding`) : cohérence de marque pour un
  visiteur anonyme prime sur sa préférence système — voir mécanisme
  ci-dessus.
- **Sidebar admin** (`.admin-theme`, `globals.css`) : reste bleu-nuit
  fixe dans les deux thèmes — c'est un habillage de marque du
  back-office, pas un mode sombre ; ne redéfinit que `--sidebar*`,
  jamais `--background`/`--foreground`, donc compatible sans conflit
  avec `.dark` sur le reste du contenu admin.
- **Logo** (`src/components/Logo.tsx`) : couleurs de marque fixes
  (navy/bleu/vert), indépendantes du thème — `tone="white"` existe déjà
  pour les fonds sombres explicites (pas pilotée par `.dark`).

## Points vérifiés, non modifiés

- Icônes glassmorphism (`src/lib/icons.tsx`) : couleurs fixes dans leur
  propre SVG, déjà documentées comme non teintables — lisibles sur fond
  sombre (fond de carte clair implicite dans leur design).
- Illustrations `EmptyState` : PNG/JPEG sur fond neutre, pas de
  problème de contraste constaté.
- Composants shadcn (`Button`, `Dialog`, `Sheet`, `Table`,
  `DropdownMenu`, `Tabs`, `Sonner`) : utilisent déjà les tokens
  sémantiques (`--card`/`--popover`/`--border`), redéfinis dans `.dark`
  — basculent correctement sans changement de composant.

## Vérification

- `npm run lint && npx tsc --noEmit && npm run build`.
- `forcedTheme` vérifié par script Playwright (contexte
  `colorScheme: "dark"` émulé) : `/login` et `/` restent en classe
  `light` / fond `#f8fafc` malgré la préférence système sombre.
- Vérification visuelle des pages authentifiées (`/dashboard`,
  `/sales/new`, `/settings`, `/admin/*`) en Clair/Sombre non faite dans
  cet environnement — le navigateur headless sandboxé ne peut pas
  compléter une vraie connexion Supabase ici (limite déjà documentée
  dans une session précédente). À vérifier manuellement après
  déploiement : basculer les 3 options sur `/dashboard`, `/sales/new`,
  `/products`, `/credits`, `/reports`, `/settings`, et 2-3 pages
  `/admin/*`.
