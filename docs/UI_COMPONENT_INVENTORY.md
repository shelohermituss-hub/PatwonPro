# Inventaire composants — shadcn/ui

Liste des composants nécessaires par module, ce qui est **déjà installé**
(`src/components/ui/`), ce qui **existe dans le registre shadcn mais pas
encore installé** (vérifié via `npx shadcn@latest search`, aucune
installation faite dans ce document — voir consigne "ne pas modifier le
code"), et ce qui doit être **construit sur-mesure** (aucun équivalent
shadcn direct).

## Déjà installés (26 composants, `src/components/ui/`)

`button`, `card`, `input`, `label`, `dialog`, `sheet`, `dropdown-menu`,
`select`, `tabs`, `table`, `badge`, `tooltip`, `separator`, `avatar`,
`command`, `popover`, `skeleton`, `alert-dialog`, `calendar`, `switch`,
`checkbox`, `scroll-area`, `progress`, `sonner`, `textarea`,
`input-group`.

**Écart constaté** : un `npx shadcn add ... form ...` a été exécuté
précédemment mais aucun `form.tsx`/`field.tsx` n'existe dans
`src/components/ui/` — cette version de shadcn expose les formulaires
via `field`/`field-group` (pas un composant `form` monolithique), qui
n'a pas été installé. À corriger dès le premier écran avec formulaire
(voir tableau ci-dessous).

## À installer — confirmés dans le registre `@shadcn`

| Composant | Commande | Modules qui en ont besoin |
|---|---|---|
| `field` | `npx shadcn add field` | **Tous les formulaires** (Pwodwi, Kredi, Paramèt, Auth) — règle shadcn : `FieldGroup`+`Field`, jamais un `div`+`space-y-*` brut |
| `radio-group` | `npx shadcn add radio-group` | Paramèt (choix plan abònman), fòm chwa unik |
| `slider` | `npx shadcn add slider` | Antre Stòk (ajisteman kantite, si UI slider retenue), Rapò (filtre plage) |
| `toggle-group` | `npx shadcn add toggle-group` | POS (mode Kach/MonCash/NatCash/Kredi — 2 à 7 choix, règle shadcn : jamais une boucle de `Button` avec état actif manuel) |
| `pagination` | `npx shadcn add pagination` | Pwodwi (liste), Kredi (historique), Rapò |
| `empty` | `npx shadcn add empty` | **Chaque écran de liste** (Pwodwi, Kredi, Rapò, Antre Stòk, Abònman) — le kit `design-system/` a un fichier "Empty" par module, confirmant que c'est un état systématique à couvrir |
| `spinner` | `npx shadcn add spinner` | État loading — composer avec `disabled` sur les boutons en cours d'action (règle shadcn : pas de prop `isLoading` sur `Button`) |
| `chart` | `npx shadcn add chart` | Tablo Bò, Rapò (wrap Recharts déjà en dépendance) |
| `breadcrumb` | `npx shadcn add breadcrumb` | Paramèt (sous-sections), détail Pwodwi/Kliyan si navigation profonde |

## Composants sur-mesure (aucun équivalent shadcn direct)

| Composant | Description | Base technique |
|---|---|---|
| `SyncStatusBadge` | **Déjà construit** (`src/components/SyncStatusBadge.tsx`) — statut réseau + compteur d'actions en attente | `useOnlineStatus`, `usePendingSyncCount` (déjà en place) |
| `ProductGridCard` | Carte produit tactile pour la grille POS — image/placeholder, nom, prix, tap pour ajouter au panier | `Card` + `Button` shadcn en composition |
| `Cart` (panier POS) | Liste des articles du panier, quantité +/-, sous-total, total | `ScrollArea` + composants custom de ligne — pas d'équivalent shadcn |
| `NumericKeypad` | Clavier numérique pour saisie de montant/quantité au tactile (paiement, remise) | 100% custom — aucun écran du kit `design-system/` n'en montre, à concevoir de zéro (voir `DESIGN_AUDIT.md` §5) |
| `KpiStatCard` | Carte KPI avec titre, valeur, tendance, barre de progression colorée | `Card` + `Progress` shadcn en composition — inspiré de `design-system/Invoices/List/01.png` et `Calendar.png` |
| `IconChip` | Icône flat-color-icons (`src/lib/icons.ts`) dans un carré arrondi de couleur douce (catégories, types) | `div` + classes Tailwind, pas de composant shadcn dédié — pattern vu dans `design-system/Products/List/01.png` |
| `DataTable` | Wrapper autour de `table` shadcn : tri de colonnes, sélection multiple, menu d'action par ligne, pagination | Compose `table` (existant) + `pagination` (à installer) + `dropdown-menu` (existant) |
| `StatusBadge` (métier) | Badge teinte douce mappé aux statuts métier (`payment_status`, `payment_transactions.status`) | `Badge` shadcn avec variantes couleur custom (`success`/`warning`/`danger`) — **ne pas** copier les couleurs exactes du kit (voir `DESIGN_SYSTEM.md`) |
| `RadialProgress` (donut) | Anneau de progression concentrique (ex. objectif de vente du jour) | Recharts `RadialBarChart` — aucun équivalent shadcn natif, vu dans `design-system/Products/List/01.png` |
| Auth split-screen layout | Formulaire d'un côté, panneau illustratif de l'autre | Layout custom `(auth)/layout.tsx` (n'existe pas encore) — inspiré de `design-system/Sign In.svg` |

## Par module

### Tablo Bò (Dashboard)
`card`, `chart` (à installer), `KpiStatCard` (custom), `empty` (à installer, si aucune vente du jour).

### Pwen Vant (POS)
`ProductGridCard` (custom), `Cart` (custom), `NumericKeypad` (custom), `toggle-group` (à installer, mode paiement), `sheet` (existant, panneau panier/détail sur tablette au lieu d'une modale), `dialog`/`alert-dialog` (existant, confirmation "Konfime vant lan"/"Anile"), `sonner` (existant, confirmation de vente).

### Pwodwi (Produits/Stock)
`DataTable` (custom, compose `table`+`pagination`), `field`+`input`+`select` (formulaire produit — `field` à installer), `badge` (alerte stock bas — `warning`), `empty` (à installer), `IconChip` (custom, catégories).

### Antre Stòk (Mouvements de stock)
`field`, `select`, `input-group` (quantité + unité), `table` (historique des mouvements).

### Kredi (Crédits clients)
`DataTable` (custom), `StatusBadge` (custom — Payé/Partiel/En retard, inspiré du pattern `design-system/Invoices/List/01.png` mais couleurs du produit, pas du kit), `sheet` (détail client + historique de versements), `field` (formulaire versement).

### Rapò (Rapports)
`chart` (à installer), `KpiStatCard` (custom), `DataTable` (custom), `pagination` (à installer).

### Abònman / Sipò
`card` (état abonnement), `badge` (statut `trialing`/`active`/`past_due`), `table` (liste appareils/tablettes), `field`+`textarea` (nouveau ticket support) — inspiré de `design-system/Help Center.png` pour la structure liste de tickets, sans en reprendre le style visuel exact.

### Paramèt
`tabs` (sections Compte/Boutique/Anplwaye), `field`+`radio-group` (à installer), `switch` (existant, préférences), `avatar` (existant, photo profil).

### Auth (login/register)
Layout split-screen custom, `field`+`input` (à installer/existant), `button` (existant) — inspiré structurellement de `design-system/Sign In.svg`/`Sign Up.svg` (illustration à refaire, pas réutiliser celle du kit qui n'est pas à la marque PatwonPro).

### `(admin)` — platform_admin
`table` (liste boutiques/abonnements/appareils à travers toutes les boutiques), `badge`, `DataTable`.

## Notes de composition (rappel skill `shadcn`)

- Chaque `SelectItem` dans un `SelectGroup`, chaque `DropdownMenuItem`
  dans un `DropdownMenuGroup` — jamais un item orphelin.
- Icônes dans les boutons : attribut `data-icon="inline-start"` ou
  `"inline-end"`, jamais de classe de taille manuelle (`size-4`) sur
  l'icône — le composant gère déjà ça.
- `Dialog`/`Sheet`/`AlertDialog` : toujours un titre (`DialogTitle`,
  etc.), `className="sr-only"` si visuellement masqué — requis pour
  l'accessibilité, pas optionnel.
- Espacement : `flex`+`gap-*`, jamais `space-y-*`/`space-x-*`.
