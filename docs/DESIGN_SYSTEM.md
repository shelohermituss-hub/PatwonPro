# Design System — PatwonPro

Référence d'implémentation pour l'UI de l'application. **`docs/CLAUDE.md`**
("Tokens visuels", "Règles UI") reste la source de vérité produit/design —
ce document formalise comment ces décisions sont (et doivent être)
implémentées dans le code, en intégrant les enseignements de
`docs/DESIGN_AUDIT.md` (analyse du kit visuel fourni). En cas de
divergence, `docs/CLAUDE.md` gagne toujours.

## Principes

- **Tablette d'abord, paysage** : cible 10 pouces, 1280×800. Le layout
  dashboard utilise un sidebar fixe (248px), jamais une tab bar basse.
- **POS fintech premium, simple d'usage** : moderne/pro à l'écran, mais
  sans jargon technique visible, actions critiques explicites ("Konfime
  vant lan", "Anile", "Anrejistre").
- **Créole d'abord** : tout texte visible par le commerçant est en créole
  haïtien par défaut (`docs/CLAUDE.md`).
- **Le kit `design-system/` est une référence de layout, pas une source
  de tokens** — voir `docs/DESIGN_AUDIT.md` §6 : ses couleurs/rayons sont
  proches mais pas identiques à nos décisions déjà prises, et aucune
  police n'est vérifiable depuis ses fichiers (texte vectorisé).

## Tokens — variables CSS (`src/app/globals.css`)

Toutes les valeurs ci-dessous sont **déjà implémentées** dans `:root` /
`.dark`. Ne pas les réinventer ailleurs dans le code — toujours passer
par les classes Tailwind générées (`bg-primary`, `text-danger`, etc.).

```css
:root {
  /* Marque */
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-foreground: #ffffff;
  --warning: #f59e0b;
  --success: #16a34a;
  --danger: #dc2626;

  /* Dégradé de marque (logo, panneau héro auth — jamais un fond de
     composant par défaut, voir la note plus bas) + point d'accent */
  --brand-gradient-start: #4f46e5;
  --brand-gradient-via: #7c3aed;
  --brand-gradient-end: #06b6d4;
  --brand-accent: #facc15;

  /* Neutres produit (pas les neutres shadcn — voir plus bas) */
  --surface: #ffffff;
  --text-secondary: #64748b;
  --background: #f8fafc;
  --foreground: #0f172a;

  /* Layout */
  --sidebar-width: 248px;

  /* shadcn/ui — scaffolding neutre, ne pas repointer vers la marque */
  --border: #e2e8f0;
  --input: #e2e8f0;
  --accent: oklch(0.97 0 0);           /* hover menu/select, PAS "warning" */
  --accent-foreground: oklch(0.205 0 0);
  --destructive: #dc2626;
  --radius: 0.625rem;                   /* base — sm/xl/2xl.. dérivent de ça */
}
```

| Token | Valeur | Rôle | Classe Tailwind |
|---|---|---|---|
| `--background` | `#F8FAFC` | Fond de page | `bg-background` |
| `--surface` / `--card` | `#FFFFFF` | Cartes, modales | `bg-surface` / `bg-card` |
| `--primary` | `#4F46E5` | Boutons d'action | `bg-primary` `text-primary` |
| `--primary-hover` | `#4338CA` | Hover explicite (voir note ci-dessous) | `bg-primary-hover` |
| `--primary-foreground` | `#FFFFFF` | Texte sur fond `--primary` | `text-primary-foreground` |
| `--success` | `#16A34A` | Vente complétée, paiement reçu | `bg-success` `text-success` |
| `--warning` | `#F59E0B` | Alerte, badge stock bas, sync en attente | `bg-warning` `text-warning` |
| `--danger` | `#DC2626` | Suppression, dette en retard | `bg-danger` `text-danger` |
| `--foreground` | `#0F172A` | Texte principal | `text-foreground` |
| `--text-secondary` | `#64748B` | Texte secondaire/label | `text-text-secondary` |
| `--border` / `--input` | `#E2E8F0` | Bordures, contours de champs | `border-border` |
| `--brand-gradient-start/via/end` | `#4F46E5`/`#7C3AED`/`#06B6D4` | Dégradé de marque — logo (`Logo.tsx`), panneau héro `(auth)` | `from-brand-gradient-start via-brand-gradient-via to-brand-gradient-end` |
| `--brand-accent` | `#FACC15` | Point d'accent de marque, usage très ponctuel | `bg-brand-accent` |
| `--radius-md` | `12px` (littéral, pas dérivé de `--radius`) | Rayon "medium" | `rounded-md` |
| `--radius-lg` | `16px` (littéral) | Rayon "large" | `rounded-lg` |
| `--sidebar-width` | `248px` | Largeur du sidebar tablette | `w-sidebar` |
| `--font-sans` | Geist | Police par défaut (préset shadcn "Nova") | `font-sans` (déjà appliqué sur `<html>`) |

**Note `--primary-hover`** : le token existe et est exposé
(`--color-primary-hover` → `bg-primary-hover`/`hover:bg-primary-hover`),
mais le composant `Button` shadcn par défaut utilise
`hover:bg-primary/80` (opacité), pas ce token. Utiliser `--primary-hover`
explicitement sur des composants **custom** (pas les composants shadcn
générés) quand un hover exact `#4338CA` est requis.

**⚠️ Le dégradé de marque n'est pas un fond de composant par défaut.**
Il est réservé aux moments de marque délibérés — le logo (`Logo.tsx`) et
le panneau héro de `(auth)/layout.tsx` — jamais les boutons, cartes,
badges ou l'état actif du sidebar, qui restent `--primary` en aplat
(`docs/CLAUDE.md` : "pas de gradients excessifs").

**⚠️ `--accent`/`--accent-foreground` ne sont PAS la couleur "warning".**
Ce sont des tokens neutres shadcn/ui pour l'état hover/highlight des
menus (`DropdownMenuItem`, `SelectItem`, `CommandItem`). Les repointer
vers `#F59E0B` mettrait tous les survols de menu en orange vif. La
couleur "warning" produit vit exclusivement dans `--warning`.

**⚠️ `npx shadcn add`/`init` peut écraser ces tokens** avec les gris par
défaut du preset Nova (déjà arrivé une fois lors de l'init). Toujours
vérifier `git diff src/app/globals.css` après une commande shadcn et
restaurer le tableau ci-dessus si nécessaire.

## Recommandations Tailwind

- **Espacement** : pas d'échelle custom — utiliser l'échelle Tailwind
  par défaut (base 4px : `p-1`=4px … `p-6`=24px). C'est déjà la
  convention utilisée dans le code existant (`p-4`, `gap-3`, `px-2.5`).
  L'audit visuel du kit (`DESIGN_AUDIT.md` §3) est cohérent avec ces
  ordres de grandeur (padding carte ~24px = `p-6`, gouttière ~16–24px =
  `gap-4`/`gap-6`).
- **Rayons** : `rounded-sm`/`rounded-md`(12px)/`rounded-lg`(16px)/`rounded-xl`+
  — ne pas utiliser de valeurs arbitraires (`rounded-[10px]`), toujours
  passer par l'échelle nommée pour rester cohérent si les tokens changent.
- **Couleurs** : jamais de couleur brute (`bg-blue-600`, `text-[#4f46e5]`)
  dans le code produit — toujours les tokens sémantiques (`bg-primary`,
  `text-danger`). Les couleurs brutes Tailwind restent acceptables
  uniquement dans les illustrations/graphiques Recharts si un dégradé
  categorical est nécessaire.
- **Taille tactile** : `size-12` (48px) minimum sur toute cible tactile
  (`docs/CLAUDE.md` — 48×48px minimum), y compris les icônes cliquables
  isolées (pas seulement les boutons avec texte).
- **Dark mode** : implémenté — `next-themes` (`AppThemeProvider`, monté
  une seule fois dans `src/app/layout.tsx`), toggle Clair/Sombre/Sistèm
  dans l'onglet "Aparans" de `/settings` (commerçant) et
  `/admin/settings` (admin). Voir `docs/DARK_MODE.md` pour
  l'architecture complète, la liste des tokens ajustés en `.dark`, et
  la règle "landing/auth toujours en clair".

## Composants (shadcn/ui)

`npx shadcn@latest init --defaults` déjà exécuté — Base UI (pas Radix),
preset Nova, `components.json` à la racine. Composants déjà ajoutés :
`button`, `card`, `input`, `label`, `form`, `dialog`, `sheet`,
`dropdown-menu`, `select`, `tabs`, `table`, `badge`, `tooltip`,
`separator`, `avatar`, `command`, `popover`, `skeleton`, `alert-dialog`,
`calendar`, `switch`, `checkbox`, `scroll-area`, `progress`, `sonner`,
`textarea`, `input-group` — voir `src/components/ui/`. Utiliser `npx
shadcn@latest add <component>` pour en ajouter d'autres plutôt que
d'écrire du markup brut — voir le skill `shadcn`
(`.claude/skills/shadcn`) pour les règles de composition, et
`docs/UI_COMPONENT_INVENTORY.md` pour la liste des composants restant à
construire/adapter pour PatwonPro spécifiquement.

Les icônes de contenu viennent d'un pack **glassmorphism** fourni par
l'utilisateur (SVG statiques, `public/icons/glass/`), via un registre
central `src/lib/icons.tsx` (une clé sémantique par concept, ex.
`Icons.product`, `Icons.credit`) plutôt que des imports ad-hoc par
fichier. Ces icônes ont des couleurs fixes dans leur propre SVG (pas
`currentColor`) — un conteneur `bg-primary/10 text-primary` autour ne
teinte plus que du texte voisin, jamais l'icône elle-même. Lucide React
reste utilisé pour les glyphes internes shadcn (chevron, coche, croix)
et tous les spinners `LoaderCircle`. Jamais d'emoji comme icône
d'interface.

**Écart assumé vs le kit `design-system/`** : le kit utilise des champs
en soulignement simple (voir `DESIGN_AUDIT.md` §4) ; on garde les inputs
encadrés par défaut de shadcn — meilleure affordance tactile et état
focus plus visible sur tablette.

## Layout

- **Sidebar tablette** (`src/components/AppSidebar.tsx`, `DashboardShell.tsx`) :
  composant shadcn `Sidebar` (`collapsible="icon"`, largeur 248px via
  `--sidebar-width` sur `SidebarProvider`) — logo boutik + liste de
  modules (Tablo Bò, Pwen Vant, Pwodwi, Antre Stòk, Kredi, Rapò,
  Abònman, Paramèt) chacun avec une icône du registre (`src/lib/icons.tsx`),
  pwofil + dekonekte ak `SyncStatusBadge` en bas.
  Le lien actif est marqué par le style neutre par défaut du composant
  (`--sidebar-accent`, gris léger — pas la couleur de marque). État ouvert/fermé persisté par cookie
  (`sidebar_state`, lu côté serveur dans `(dashboard)/layout.tsx` pour
  éviter un flash). **Écart assumé vs le kit** : le kit propose un rail
  icône-seule fixe (~72–84px) ; ici le mode labellisé (248px) reste le
  défaut — plus lisible pour des commerçants non-techniques — mais
  `collapsible="icon"` permet de le réduire volontairement (bouton
  `SidebarTrigger`, ou `Ctrl/Cmd+B`) pour gagner de la place sur le POS.
  Voir `DESIGN_AUDIT.md` §6.
- **`(admin)` séparé** : le rôle `platform_admin` n'a pas de `store_id`,
  donc il n'entre pas dans `(dashboard)` (toujours scopé à une boutique)
  — il a sa propre section (`(admin)/admin`) pour la gestion
  abonnement/appareils/support à travers toutes les boutiques.

## Accessibilité

- Contraste minimum AA (WCAG) entre texte et fond.
- Toute icône d'action doit avoir un `aria-label` en créole.
- Navigation clavier avec état `focus-visible` sur tout élément
  interactif.
- Voir `docs/UI_RULES.md` pour les règles détaillées (tablette,
  responsive, offline).

## Animation

- **Librairie** : [Motion](https://motion.dev) (`motion` sur npm, import
  `from "motion/react"`) — pas `framer-motion` (ancien nom du même
  paquet, ne jamais l'installer/importer).
- **Tokens partagés** (`src/lib/motion.ts`) : `EASE` (`[0.16, 1, 0.3, 1]`,
  courbe "ease-out-expo" douce), `DURATION` (`fast`/`base`/`slow`),
  variants réutilisables `fadeUp`/`staggerContainer`/`staggerItem`,
  `springTransition`. Toujours réutiliser ces tokens plutôt que des
  valeurs de timing/easing arbitraires par composant.
- **Primitives partagées** (`src/components/motion/`) :
  `PageFade` (fade + slide-up de montage de page), `Reveal`/`RevealGroup`
  (scroll-reveal `whileInView`, déclenché une seule fois), `AnimatedNumber`
  (count-up, prend `value: number` + `format: (n) => string` — jamais une
  chaîne pré-formatée), `Stagger`/`StaggerGroup` (stagger au montage, pas
  au scroll — grilles au-dessus de la ligne de flottaison), `SuccessCheck`
  (icône de succès dessinée par `pathLength`), `FormError` (message
  d'erreur de formulaire avec fade + secousse horizontale).
- **`prefers-reduced-motion` systématique** : toute nouvelle animation
  JS doit consulter `useReducedMotion()` (de `motion/react`) et soit
  désactiver l'animation (`initial={false}`), soit passer `duration: 0` —
  même principe que le `motion-safe:` déjà utilisé pour les `@keyframes`
  CSS du panneau héro `(auth)`.
- **Transition de page par groupe de routes** : `src/app/(dashboard)/template.tsx`
  et `src/app/(auth)/template.tsx` enveloppent leurs enfants dans
  `PageFade` — `template.tsx` se remonte à chaque navigation
  (contrairement à `layout.tsx`), donnant une entrée de page cohérente
  sans configurer `AnimatePresence`. **Pas de `template.tsx` à la
  racine** : un template racine engloberait aussi `(admin)` (thème
  séparé, hors périmètre de ce système d'animation côté commerçant) et
  se remonterait en double avec `(dashboard)`/`(auth)` (route groups
  transparents pour l'URL, pas pour l'arbre de layout).
- **Limite connue** : les icônes `Icons.*` (`src/lib/icons.tsx`) restent
  des `<img>` statiques avec des couleurs fixes — pas d'animation de
  tracé ou de couleur au niveau de l'icône elle-même. Pour animer un
  élément qui contient une icône, animer le conteneur autour (scale,
  fond, bordure) plutôt que l'icône.

### Haptique (vibration tactile)

- **Utilitaire** (`src/lib/haptics.ts`) : `haptics.tap()`/`select()`/
  `adjust()`/`remove()`/`success()`/`warning()`/`error()` — presets
  gradués (`navigator.vibrate()`), plutôt que des tableaux de
  millisecondes ad-hoc par composant. Toujours passer par ces presets.
- **Limite plateforme permanente** : Android Chrome seulement — iOS
  Safari n'a jamais implémenté l'API Vibration (limite Apple, pas un
  bug de ce code). `haptics.ts` ne lève jamais d'erreur sur iOS, il ne
  fait simplement rien.
- **Branché** : tuile produit POS (`tap`), quantité panye/retire ligne
  (`adjust`/`remove`), mwayen peman/checkout (`select`), vant konplete
  (`success`)/echèk (`error`), `ConfirmActionDialog` admin (`warning`
  au clic si `destructive`, `success`/`error` selon le résultat —
  couvre toutes les actions sensibles admin d'un seul coup), toggle
  tèm aparans (`select`), switch preferans notifikasyon (`tap`/`error`),
  soumission fòm pwodwi/antre stòk/nouvo kliyan/kredi/envitasyon
  anplwaye/kanpay notifikasyon (`success`/`error`).

## `design-system/`

Le contenu actuel est un kit UI SaaS générique (voir
`docs/DESIGN_AUDIT.md`) — à utiliser comme référence de layout/patterns,
pas comme source de tokens exacts. Si un nouvel export plus ciblé
PatwonPro est ajouté :
1. Le décompresser directement dans `design-system/` (aplatir tout
   dossier intermédiaire sans nom venant du zip).
2. S'il contient de vrais tokens (JSON/CSS), les reporter dans
   `src/app/globals.css` (`:root`/`@theme`) — **vérifier d'abord contre
   `docs/CLAUDE.md`**, qui reste la source de vérité produit.
3. Reporter les icônes/assets SVG utiles dans `src/components/icons/`
   (ou utiliser `src/lib/icons.ts`/`lucide-react` directement si
   l'export correspond).
4. Mettre à jour ce document et `docs/DESIGN_AUDIT.md` si les vraies
   valeurs diffèrent de ce qui précède.
