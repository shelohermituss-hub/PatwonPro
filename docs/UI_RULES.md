# Règles UI — Tablette, Responsive, Accessibilité, Offline

Règles opérationnelles pour tout écran Jere Boutik. Complète
`docs/CLAUDE.md` ("Règles UI") et `docs/DESIGN_SYSTEM.md`. Le kit
`design-system/` ne couvre aucun breakpoint tablette (voir
`docs/DESIGN_AUDIT.md` §3) — les règles ci-dessous sont donc définies
pour Jere Boutik, pas extraites du kit.

## 1. Tablette 10 pouces, paysage (cible principale — 1280×800)

- **Layout de référence** : sidebar fixe `w-sidebar` (248px) + zone de
  contenu fluide. Ne jamais faire disparaître le sidebar en paysage tablette
  — c'est la navigation principale, pas un tiroir.
- **Grilles de contenu** (POS, Pwodwi) : viser 3 à 4 colonnes de cartes
  produit dans la zone de contenu restante (~1032px de large après le
  sidebar à 1280px total) — recalculer, ne pas copier un nombre de
  colonnes pensé pour du desktop 1680px (voir écart de canvas,
  `DESIGN_AUDIT.md` §3).
- **Cibles tactiles** : 48×48px minimum sur tout élément cliquable
  (boutons, icônes isolées, lignes de tableau cliquables, cases à
  cocher). Une ligne de `DataTable` entière doit être cliquable si elle
  ouvre un détail, pas seulement le texte.
- **Formulaires** : privilégier 2 colonnes de champs sur tablette
  paysage plutôt qu'une seule colonne étirée sur toute la largeur — un
  champ de saisie ne doit jamais dépasser ~480px de large (lisibilité).
- **Sheet plutôt que Dialog pour les tâches longues** (`docs/CLAUDE.md`) :
  un formulaire de plus de ~4 champs, un détail client/produit, un
  historique → `Sheet` latéral (largeur ~420–480px). Une confirmation
  courte (1–2 phrases, "Konfime vant lan"/"Anile") → `AlertDialog`/`Dialog`
  centré.
- **Clavier virtuel** : sur Android, l'apparition du clavier réduit la
  hauteur visible — tout écran avec saisie (POS, formulaire) doit rester
  utilisable avec le clavier ouvert (champ actif visible, ne pas coller
  d'action critique tout en bas de l'écran sans marge de sécurité).
- **Orientation verrouillée** : l'app est conçue paysage — si le PWA
  manifest autorise le portrait, prévoir un message "Tourne ta tablèt"
  plutôt qu'un layout cassé (pas encore implémenté — à couvrir en
  `08-pwa.md`).

## 2. Responsive mobile (secondaire — téléphone Android)

Le mobile n'est pas la cible principale (`docs/CLAUDE.md`), mais
l'application doit rester utilisable en dépannage (le propriétaire qui
consulte un rapport depuis son téléphone).

- **Sidebar → navigation compacte** sous ~768px de large : remplacer le
  sidebar fixe par soit un tiroir (`Sheet` déclenché par un bouton
  hamburger), soit une barre d'onglets basse à 4–5 entrées maximum
  (POS, Pwodwi, Kredi, Rapò, Plis). Ne pas essayer de compresser le
  sidebar 248px en icônes seules à la volée — c'est un layout différent,
  pas un rétrécissement.
- **Grilles → 1–2 colonnes** en dessous de 480px, **2–3 colonnes** entre
  480–768px.
- **Tableaux** (`DataTable`) : sous ~640px, basculer vers une liste de
  cartes (une carte = une ligne, colonnes clé/valeur empilées) plutôt
  qu'un scroll horizontal — un tableau qui scrolle horizontalement sur
  mobile est un échec d'utilisabilité, pas une solution.
- **Formulaires** : toujours 1 colonne sur mobile, quelle que soit la
  règle tablette du §1.
- Tester avec les DevTools en 375×812 (référence iPhone standard,
  cohérent avec les mockups `[Mobile]` du kit) et une largeur Android
  courante (360×800).

## 3. Accessibilité

- **Contraste** : AA minimum (4.5:1 texte normal, 3:1 grand texte/UI) —
  vérifier chaque paire texte/fond des tokens `docs/DESIGN_SYSTEM.md`
  avant de l'utiliser pour du texte. Ne jamais utiliser `--warning`
  (`#F59E0B`) comme couleur de texte sur fond blanc sans vérification
  (le jaune/orange clair échoue facilement AA) — préférer
  fond-teinté-clair + texte foncé pour les badges warning (déjà la
  convention `bg-warning/10 text-warning-foreground`-style en place).
- **Labels & `aria-label`** : tout contrôle icône-seule (bouton
  supprimer, fermer un `Sheet`, action de ligne "...") a un
  `aria-label` en créole, jamais seulement un `title` HTML.
- **Focus visible** : `focus-visible` sur tout élément interactif — ne
  jamais faire `outline-none` sans remplacer par un style de focus
  équivalent ou supérieur. Layout de base déjà correct
  (`@apply border-border outline-ring/50` dans `globals.css`).
- **Navigation clavier** : POS et formulaires doivent être utilisables
  au clavier (Tab/Shift+Tab/Entrée/Échap) même si l'usage réel est
  tactile — utile pour un clavier Bluetooth branché sur la tablette en
  poste fixe, et c'est un prérequis d'accessibilité de toute façon.
- **Titres de `Dialog`/`Sheet`/`AlertDialog`** : toujours présents
  (`DialogTitle` etc.), `className="sr-only"` si masqué visuellement —
  règle shadcn non négociable pour les lecteurs d'écran.
- **Texte redimensionné** : le layout ne doit pas casser si l'utilisateur
  augmente la taille de police du navigateur/OS (pas de hauteur de ligne
  fixe en `px` sur du texte qui peut s'agrandir).
- **Ne jamais coder une information uniquement par la couleur** — un
  badge de statut doit aussi porter un texte ("Peye", "Anreta"), pas
  seulement une pastille colorée, pour les utilisateurs daltoniens.

## 4. États offline (offline-first — `docs/CLAUDE.md`, `ARCHITECTURE.md`)

Chaque écran qui affiche ou modifie des données doit gérer explicitement
les **4 états** suivants (déjà une exigence `docs/CLAUDE.md`) :

| État | Comportement attendu |
|---|---|
| **Loading** | `Skeleton` (existant) pendant le premier chargement — jamais un écran blanc. Pas de spinner plein écran pour un simple refresh de liste déjà affichée. |
| **Empty** | Composant `empty` (à installer, voir `UI_COMPONENT_INVENTORY.md`) avec message créole + action pertinente ("Ajoute premye pwodwi ou") — jamais un tableau vide sans explication. |
| **Error** | Message d'erreur créole explicite + action de retry si pertinent — jamais une erreur technique brute (stack trace, code HTTP) affichée au commerçant. |
| **Offline** | Indication visible (`SyncStatusBadge`, déjà construit) + comportement dégradé cohérent (voir ci-dessous), jamais un écran qui plante silencieusement faute de réseau. |

### Règles spécifiques par nature d'écran

- **POS (vente cash)** : doit fonctionner **entièrement hors ligne**
  (`docs/CLAUDE.md`) — écriture immédiate dans IndexedDB (Dexie), sync
  en arrière-plan (`src/lib/sync/`, backoff déjà implémenté). Aucune
  action de vente cash ne doit jamais être bloquée par l'absence de
  réseau.
- **Paiement MonCash/NatCash** : nécessite le réseau par nature (appel
  API fournisseur) — si offline, désactiver l'option de paiement mobile
  dans le sélecteur (pas juste laisser échouer l'appel), avec un message
  explicite ("MonCash mande koneksyon — eseye kach oswa kredi pou kounye a").
- **Rapò (lecture directe Supabase, pas Dexie)** : si offline, afficher
  un état dédié ("Rapò mande koneksyon" — déjà anticipé dans
  `docs/PROMPTS/08-pwa.md`), pas une erreur générique. Ne pas essayer de
  reconstruire les rapports depuis Dexie (source de vérité = Supabase
  pour les agrégats).
- **Écrans en lecture depuis Dexie** (Pwodwi, panier POS) : doivent
  s'afficher normalement offline, avec les données de la dernière
  synchronisation — pas de distinction visuelle nécessaire sauf le
  badge global de statut réseau.
- **Indicateur global** : `SyncStatusBadge` (déjà en place dans le
  sidebar) est la seule source de vérité visuelle pour l'état
  réseau/sync — ne pas dupliquer cette information avec un autre
  indicateur ad hoc sur un écran spécifique.

## 5. Checklist avant de considérer un écran terminé

- [ ] Testé à 1280×800 paysage (cible principale).
- [ ] Testé à 375×812 (mobile, secondaire).
- [ ] Les 4 états (loading/empty/error/offline) sont couverts.
- [ ] Toutes les cibles tactiles ≥ 48×48px.
- [ ] Contraste AA vérifié sur le texte utilisant `--warning`/`--success`.
- [ ] Tout contrôle icône-seule a un `aria-label` en créole.
- [ ] Aucune couleur brute Tailwind (`bg-blue-600`, etc.) — uniquement
      les tokens sémantiques de `docs/DESIGN_SYSTEM.md`.
- [ ] Textes visibles à l'utilisateur en créole (`docs/CLAUDE.md`).
