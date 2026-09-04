# Audit du dossier `design-system/`

Analyse du contenu réel de `design-system/` (112 fichiers, ~21 Mo — 19 SVG, 17+ PNG, majoritairement du `.png`/`.svg` réparti sur 15 dossiers). Méthode : extraction textuelle exhaustive de tous les SVG (couleurs hex, `rx` d'arrondi, dimensions de canvas — 100% des fichiers vectoriels), plus inspection visuelle d'un échantillon représentatif de captures PNG (Forms, Forms/Elements, Calendar, Products/List, Invoices/List, Help Center). Ce document ne fait aucune supposition non vérifiable — chaque affirmation cite sa source.

## 1. Nature du kit

C'est un **kit UI SaaS générique** ("CRAFTUI LLC" visible dans l'en-tête des captures), pas une maquette PatwonPro. Les écrans couvrent : Calendar, Contacts, Dashboard, Help Center, Invoices, Messages, Notifications, Products, Reports, Task/Tasks, Ui (Forms), plus un flow d'authentification (Sign In/Sign Up/Recover/Finish/Details). Aucun logo, aucune police embarquée, aucune icône de marque PatwonPro.

## 2. Assets disponibles

| Type | Présent ? | Détail |
|---|---|---|
| Logo PatwonPro | ❌ | Le seul logo visible est celui du kit ("C" bleu, "CRAFTUI LLC") — à ignorer, pas réutilisable |
| Icônes | ⚠️ | Icônes vectorisées **intégrées aux SVG des écrans** (sidebar, boutons) — pas de bibliothèque d'icônes séparée exportée. Aucune icône exploitable isolément sans découpage manuel |
| Illustrations | ✅ | Personnages plats géométriques (Help Center, écrans "Empty") — palette dédiée non-UI (voir §5) |
| Polices | ❌ | Tout le texte est **vectorisé en tracés** (`grep -c "<text"` = 0 sur les 19 SVG) — aucun nom de police, taille ou graisse n'est extractible programmatiquement |
| Photos/avatars | ✅ | Avatars clients (Invoices, Messages) — photos stock génériques, non réutilisables telles quelles |
| Fichiers de tokens (JSON/CSS) | ❌ | Aucun — uniquement des captures d'écran et exports vectoriels, pas d'export Figma Tokens/Style Dictionary |

## 3. Couleurs, espacements, rayons, typographie

### Couleurs (comptage d'occurrences hex sur les 19 SVG)

| Rôle probable | Hex | Occurrences | Source |
|---|---|---|---|
| Primaire (clair) | `#5E81F4` | 89 | fills récurrents boutons/liens/icônes actives |
| Primaire (foncé/hover) | `#1B51E5` | 78 | variante foncée du même bleu |
| Texte principal | `#1C1D21` | 75 | quasi-noir, titres et corps de texte |
| Texte secondaire / muted | `#8181A5` | 117 (le plus fréquent) | labels, texte de support |
| Texte secondaire (foncé) | `#464A5F`, `#3F3D56` | 46, 36 | variantes de gris-violet |
| Bordures / dividers | `#E2E2EC`, `#D6D8E0`, `#ECECF2`/`#ECECF3`, `#E5E7EB` | 29, 28, 27, 6 | lignes, contours de champs |
| Fond de surface | `#F5F5FA`, `#F0F0F3` | 16, 10 | fond d'app (teinte lavande, **pas gris neutre pur**) |
| Succès (teinte kit) | `#7CE7AC`, `#8AF1B9` | 8, 8 | menthe claire — voir avertissement §5 |
| Erreur (teinte kit) | `#FC6681`, `#FF808B`, `#F86D70` | 5, 4, 3 | corail/rose |
| Avertissement (teinte kit) | `#FFD037`, `#F4BE5E` | 4, 3 | or/jaune |
| Illustration seulement (teintes peau) | `#A0616A`, `#DB8B8B`, `#AE6E79`, `#FBBEBE`, `#FFB9B9` | — | **jamais pour l'UI**, uniquement les personnages des illustrations |

Capture Calendar/Products/Invoices (inspection visuelle) : badges/pastilles en **teinte douce** (fond clair de la couleur + texte plein de la même couleur), jamais de couleur saturée en fond de zone large — cohérent avec notre convention `bg-*/10 text-*` déjà en place.

### Rayons (`rx` sur `<rect>`, 19 SVG)

| Valeur | Occurrences | Usage probable |
|---|---|---|
| `8` | 31 (le plus fréquent) | rayon "medium" par défaut (cartes, champs) |
| `10` | 11 | variante large |
| `12` | 9 | cartes/conteneurs |
| `6` | 9 | petits éléments |
| `4`–`5` | 6+6 | badges, cases à cocher |
| `36` | 1 | coin du cadre téléphone dans l'illustration Sign In — **pas un token UI**, à ignorer |

### Dimensions de canvas (tous les SVG)

| Contexte | Dimensions | Fichiers |
|---|---|---|
| Auth (Sign In/Up/Recover/Finish/Details) | 1440×900 | 5 fichiers |
| Desktop app (Dashboard, Tasks, Contacts, Invoices, Notifications, Reports) | **1680×1020** | 12 fichiers, confirmé aussi sur les PNG (`file` : 1680×1020) |
| Mobile | 375×812 (jusqu'à 375×1244 pour du contenu scrollable) | tous les fichiers `[Mobile]` |

**Aucun canvas tablette (768–1280px) n'existe dans le kit.** Voir §5.

### Typographie

**Impossible à extraire avec certitude** — le texte est vectorisé (tracés, pas d'élément `<text>`). Impression visuelle sur les captures inspectées : sans-serif géométrique/grotesque, titres en gras (~24–32px), corps ~14–16px, labels ~12–13px en gris. Aucun nom de police ne peut être confirmé depuis ces fichiers — `docs/CLAUDE.md` (Plus Jakarta Sans) reste la seule source fiable pour la police du produit.

### Espacement

Pas d'export de grille/spacing scale. Estimation visuelle uniquement (Products/List, Invoices/List) : padding de carte ~24px, hauteur de ligne de tableau ~72–80px, gouttière ~16–24px. À traiter comme indicatif, pas comme mesure exacte.

## 4. Composants et patterns identifiés

| Composant | Écran source | Description |
|---|---|---|
| Sidebar icône-seule | Calendar.png, Products/List/01.png, Invoices/List/01.png, Help Center.png | Rail étroit (~72–84px), icônes empilées, switcher d'organisation en haut, avatar + pastille de statut en bas |
| Barre supérieure | toutes les captures desktop | Hamburger + titre de page à gauche, recherche + bouton "+" à droite |
| Carte KPI/stat | Calendar.png (Conversion history), Invoices/List/01.png (All Invoices, Scheduled, Unpaid, Paid) | Titre + sous-titre + valeur + flèche de tendance + barre de progression colorée |
| Tableau de données | Products/List/01.png, Invoices/List/01.png | Colonne case à cocher, en-têtes triables (icône ↕), cellule vignette+texte 2 lignes, colonne badge, menu "..." par ligne, pagination numérotée |
| Segmented control / Tabs | Products (List/Grid), Invoices (All/Draft/Scheduled/Paid), Help Center (Personal/Business/...) | Piste grise, item actif en blanc/gras |
| Badge de statut (teinte douce) | Invoices/List/01.png | Paid=bleu, Scheduled=or, Unpaid=corail — fond clair + texte plein |
| Champ de texte (soulignement) | Ui/Forms.png | Label au-dessus, valeur en gras, **soulignement** (pas de bordure pleine) — états focus/erreur/succès par couleur du trait |
| Select / dropdown | Ui/Forms.png | Panneau arrondi, item survolé en fond lavande clair, item sélectionné en bleu |
| Checkbox / Radio / Toggle / Slider | Ui/Forms/Elements.png | États clairs (default/checked/disabled/error/success), toggle en pilule, slider avec bulle de valeur |
| Date picker | Ui/Forms.png | Carte arrondie, jour sélectionné en bleu plein, plage en bleu clair |
| Avatar + statut en ligne | Calendar.png, Help Center.png | Pastille verte en bas à droite de l'avatar |
| Icon-chip | Products/List/01.png (Popular categories) | Icône dans un carré arrondi de couleur douce |
| Progression circulaire/donut | Products/List/01.png | Anneaux concentriques colorés, valeur centrée — **aucun équivalent shadcn natif**, à faire en Recharts |
| États vides dédiés | `Contacts/Empty [Mobile].svg`, `Dashboard/Empty.svg`, `Tasks/Empty.svg`, `Tasks/Empty [Mobile].svg`, `Invoices/Empty.png`, `Messages/Empty.png` | Confirme que le kit prévoit systématiquement un état vide illustré par écran |
| Auth split-screen | Sign In.svg (grep structurel) | Formulaire d'un côté, panneau illustration bleu plein de l'autre |

## 5. Mapping vers les écrans PatwonPro — et ce qui manque

| Module PatwonPro | Analogue le plus proche dans le kit | Écart |
|---|---|---|
| Tablo Bò (Dashboard) | Calendar.png, Dashboard/04.svg | Bon analogue structurel (sidebar + cartes KPI + graphique) |
| Pwodwi (Produits/Stock) | Products/List/01.png | **Correspondance directe** — tableau produits quasi 1:1 réutilisable comme référence de layout |
| Pwen Vant (POS) | ❌ Aucun | **Aucun écran de caisse/checkout dans le kit.** Rien à adapter — layout POS à concevoir de zéro |
| Kredi (Crédits clients) | Invoices/List/01.png | Bonne base pour le pattern statut (Paid/Scheduled/Unpaid → Payé/Partiel/Anreta), mais Invoices = facturation B2B, pas crédit-boutique — à adapter, pas copier |
| Rapò (Rapports) | Invoices/List/01.png (cartes KPI), Reports/02.svg | Cartes KPI + tendance directement pertinentes |
| Antre Stòk | ❌ Aucun | Pas d'écran de mouvement de stock dans le kit |
| Abònman/Sipò | Help Center.png | Bon analogue pour la partie "tickets support" ; rien pour abonnement/facturation SaaS/tablettes |
| Paramèt | Contacts/Settings/*.svg | Bon analogue générique (sections Accounts/Billing/General/Notifications/Security) |
| Auth (login/register) | Sign In.svg, Sign Up.svg, Recover.svg | Directement exploitable comme structure (split-screen) |

**Aucun écran ne montre un point de vente tactile, un panier, un clavier numérique de saisie de montant, ou un flux de paiement MonCash/NatCash.** Ce sont les écrans qui comptent le plus pour PatwonPro et le kit n'en fournit aucun — le POS devra être conçu sans référence dans ces assets.

## 6. Incohérences et éléments à trancher

1. **Cible tablette absente.** Le kit ne couvre que Desktop 1680×1020 et Mobile 375×812 — rien à 1280×800 paysage. Toute adaptation vers tablette est une interpolation, pas une extraction.
2. **Couleur primaire proche mais différente.** Kit = `#5E81F4`/`#1B51E5` (bleu-indigo). `docs/CLAUDE.md` a déjà fixé `#2563EB`. Même famille (bleu), valeur différente — recommandation : garder `#2563EB` (déjà implémenté dans `globals.css`, déjà utilisé dans le code), le kit confirme juste que "bleu" est une direction cohérente.
3. **Vert "succès" du kit peu lisible.** `#7CE7AC`/`#8AF1B9` (menthe claire) échoue probablement le contraste AA en texte sur fond blanc. `docs/CLAUDE.md` a déjà choisi `#16A34A` (plus foncé, accessible) — à garder, ignorer la menthe du kit sauf en accent décoratif.
4. **Typographie non vérifiable.** Voir §3 — aucune police ne peut être confirmée depuis ces fichiers. Plus Jakarta Sans (déjà en place) reste la référence.
5. **Sidebar icône-seule vs sidebar 248px avec labels.** Le kit utilise un rail étroit sans texte ; `docs/CLAUDE.md` exige un sidebar de 248px **avec labels** (déjà implémenté dans `(dashboard)/layout.tsx`) — plus adapté à des commerçants non-techniques que des icônes seules. Recommandation : garder le sidebar labellisé déjà construit ; le rail icône-seule peut inspirer un état "réduit" futur, pas le pattern principal.
6. **Champs en soulignement vs champs encadrés shadcn.** Le kit utilise des inputs à simple soulignement ; shadcn/ui (déjà installé, déjà utilisé) utilise des inputs encadrés (bordure complète). Recommandation : garder le style shadcn encadré — meilleure affordance tactile et état focus plus visible sur tablette, ce qui compte plus que fidélité au kit.
7. **Nommage de fichiers incohérent dans le kit lui-même** : mélange de suffixe `[Mobile]` et de sous-dossiers, dossier `Task/` (singulier, 2 fichiers) coexistant avec `Tasks/` (pluriel, 6 fichiers) — signe que le kit source lui-même n'est pas parfaitement organisé ; sans impact sur PatwonPro, juste une note pour ne pas chercher une logique qui n'existe pas.
8. **Aucune annotation d'accessibilité** (contraste, ordre de focus, ARIA) n'est visible sur les captures — normal pour des exports visuels, mais ça veut dire qu'aucune garantie AA ne peut être héritée du kit ; les règles d'accessibilité de `docs/UI_RULES.md` doivent être définies indépendamment.
9. **Pas de mode sombre** dans le kit — cohérent avec l'état actuel du projet (mode sombre non prioritaire, déjà noté dans `docs/DESIGN_SYSTEM.md`).

## Sources

Toutes les affirmations ci-dessus sont vérifiables via :
```bash
# Couleurs
grep -ohE '#[0-9A-Fa-f]{6}\b' -r design-system --include="*.svg" | sort | uniq -c | sort -rn
# Rayons
grep -ohE 'rx="[0-9]+(\.[0-9]+)?"' -r design-system --include="*.svg" | sort | uniq -c | sort -rn
# Dimensions de canvas
for f in design-system/**/*.svg; do head -c 300 "$f" | grep -oE 'width="[0-9.]+" height="[0-9.]+"'; done
# Absence de texte natif
grep -c "<text" -r design-system --include="*.svg"
```
