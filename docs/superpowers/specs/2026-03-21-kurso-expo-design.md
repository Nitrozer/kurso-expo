# Kurso Expo — Design Spec

> Application iPad-first Expo (React Native) de gestion de vie étudiante. Design "cahier raffiné" sur fond parcheminé avec typographie serif expressive.

---

## Contexte

- **Utilisateur** : Enzo, étudiant ingénieur
- **Projet** : Réécriture de Kurso (initialement Flutter/iPad) en Expo/React Native
- **Cible** : iPad-first, layout 3 colonnes (rail + main + sidebar)
- **Backend** : Supabase full cloud (auth + data + storage + realtime)
- **Workflow** : `expo prebuild` (dev builds) pour accès aux modules natifs

---

## Stack technique

| Couche | Choix |
|---|---|
| Framework | Expo SDK (latest stable), `expo prebuild` |
| Navigation | Expo Router v4 (file-based) |
| State | Zustand + persist middleware (MMKV) |
| Styling | NativeWind v4 (Tailwind CSS pour RN) |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| DB Management | Supabase MCP server |
| Dessin/Stylet | `@shopify/react-native-skia` |
| Éditeur notes texte | `@10play/tentap-editor` (TipTap pour RN) |
| Calendrier | `react-native-calendars` |
| Animations | `react-native-reanimated 3` |
| Icônes | `lucide-react-native` |
| Fonts | Fraunces (variable) + DM Sans via `expo-font` |
| Cache local | MMKV (`react-native-mmkv`) |
| Audio | `expo-av` (notes vocales) |
| PDF | `expo-print` (export) |
| Fichiers | `expo-file-system` + `expo-document-picker` |
| ICS Import | `ical.js` ou parsing custom |
| Listes performantes | `@shopify/flash-list` |
| Bottom sheet | `@gorhom/bottom-sheet` |
| RRULE expansion | `rrule` (npm) — expansion client-side des récurrences |

---

## Architecture

### Approche : Monolithique Supabase

Tout passe par Supabase : auth, données, realtime. MMKV en cache local pour la réactivité. Zustand pour le state en mémoire. Pas de sync bidirectionnelle complexe — Supabase est la source de vérité unique.

### Stratégie offline & cache

- **MMKV** cache les données de l'écran courant + dashboard au démarrage
- **Sans réseau** : l'app affiche les données en cache en lecture seule. Un bandeau discret "Hors ligne" (DM Sans Medium 9px, fond #EDE8E0, icône wifi-off) apparaît en haut
- **Écriture offline** : les mutations sont mises en queue (Zustand middleware) et rejouées au retour du réseau
- **Supabase Realtime** : abonnements sur `tasks`, `schedule_events`, `notes`, `notebook_pages` pour sync multi-appareils en temps réel. Les autres tables (mood, pomodoro, flashcards) se synchronisent au fetch classique
- **TTL cache** : les données de dashboard sont rafraîchies toutes les 5 minutes quand l'app est active

### Layout iPad — 3 colonnes

```
┌──────┬────────────────────────┬──────────────┐
│ Rail │     Zone principale    │   Sidebar    │
│ 72px │        (flex)          │    280px     │
│      │                        │              │
│  K°  │                        │ Mini cal     │
│  🏠  │   Contenu de l'écran   │ Tâches       │
│  📅  │   actif                │ Notes        │
│  📝  │                        │ récentes     │
│  ☑️  │                        │              │
│  📊  │                        │              │
│ ···  │                        │              │
│  ⚡  │                        │              │
│  🧠  │                        │              │
│  😊  │                        │              │
│  🧮  │                        │              │
│  ⚙️  │                        │              │
└──────┴────────────────────────┴──────────────┘
```

- **Rail** (72px) : Logo K°, navigation principale (Home, Calendrier, Cahiers, Tâches, Stats), séparateur, extras (Pomodoro, Flashcards, Humeur, Calculatrice), avatar + settings en bas
- **Zone principale** (flex) : contenu de l'écran actif
- **Sidebar** (280px) : contenu contextuel selon l'écran actif, peut se masquer

### Navigation (Expo Router)

```
app/
├── _layout.tsx               # Root layout (providers, fonts, NativeWind)
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
├── (main)/
│   ├── _layout.tsx           # Layout 3 colonnes
│   ├── index.tsx             # Dashboard
│   ├── calendar.tsx
│   ├── notebooks/
│   │   ├── index.tsx
│   │   └── [id].tsx          # Éditeur Skia + texte
│   ├── tasks.tsx
│   ├── stats.tsx
│   ├── pomodoro.tsx
│   ├── flashcards/
│   │   ├── index.tsx
│   │   └── [deckId].tsx
│   ├── mood.tsx
│   └── calculator.tsx
└── (modals)/
    ├── new-task.tsx
    ├── new-event.tsx
    ├── import-ics.tsx
    └── settings.tsx
```

---

## Base de données Supabase

RLS activé sur toutes les tables avec policy `auth.uid() = user_id`.

### Tables

**profiles** — id (PK, refs auth.users), full_name, nickname, avatar_letter, created_at, updated_at

**subjects** — id, user_id, name, short_name, professor, icon (TEXT, nom icône lucide), color (#3D5AFE default), coefficient (REAL, pour calcul moyennes), created_at, updated_at

**schedule_events** — id, user_id, subject_id, title, location, start_time, end_time, recurrence_rule (iCal RRULE), recurrence_end, created_at, updated_at. Récurrences expandées côté client via `rrule` (npm) pour affichage dans calendrier et timeline.

**tasks** — id, user_id, subject_id, title, due_date, is_done, done_at, sort_order, created_at, updated_at

**notes** — id, user_id, subject_id, title, content (JSONB TipTap), content_preview, created_at, updated_at. Les notes sont une feature **séparée** des cahiers : les notes = texte riche (TipTap), les cahiers = dessin stylet (Skia). Le dashboard "notes récentes" affiche les **notes** (texte). Le rail a "Cahiers" pour les notebooks Skia — les notes texte sont accessibles depuis la sidebar ou via un sous-onglet dans Cahiers.

**notebooks** — id, user_id, subject_id, title, cover_color (#111 default), created_at, updated_at. ON DELETE subject → SET NULL, ON DELETE user → CASCADE.

**notebook_pages** — id, notebook_id, user_id, page_number, drawing_data (JSONB Skia), text_content, template (TEXT: 'blank'|'lined'|'grid'|'dotted'), thumbnail_url, created_at, updated_at. ON DELETE notebook → CASCADE.

**exams** — id, user_id, subject_id, title, exam_date (TIMESTAMPTZ), location, notes, created_at, updated_at. ON DELETE subject → SET NULL.

**decks** — id, user_id, subject_id, title, created_at, updated_at. ON DELETE subject → SET NULL.

**flashcards** — id, deck_id, user_id, front, back, ease_factor (REAL, 2.5 default), interval (INTEGER, 0 default), next_review (TIMESTAMPTZ), created_at, updated_at. ON DELETE deck → CASCADE.

**pomodoro_sessions** — id, user_id, subject_id, duration_minutes (INTEGER), completed_at (TIMESTAMPTZ). ON DELETE subject → SET NULL.

**mood_entries** — id, user_id, mood (TEXT, valeurs: '😊'|'🙂'|'😐'|'😕'|'😢'), note, entry_date (DATE), created_at. Contrainte UNIQUE(user_id, entry_date).

**voice_notes** — id, user_id, notebook_page_id, audio_url (TEXT, URL Supabase Storage), duration_seconds (INTEGER), created_at. ON DELETE notebook_page → SET NULL. Transcription = champ futur, non implémenté au lancement.

### Index

- `idx_events_user_time` — schedule_events(user_id, start_time)
- `idx_events_subject` — schedule_events(subject_id)
- `idx_tasks_user_due` — tasks(user_id, due_date) WHERE NOT is_done
- `idx_tasks_subject` — tasks(subject_id)
- `idx_notes_user_updated` — notes(user_id, updated_at DESC)
- `idx_notes_subject` — notes(subject_id)
- `idx_pages_notebook` — notebook_pages(notebook_id, page_number)
- `idx_flashcards_review` — flashcards(user_id, next_review) WHERE next_review IS NOT NULL
- `idx_exams_user_date` — exams(user_id, exam_date)
- `idx_notebooks_subject` — notebooks(subject_id)

### Storage Buckets

- `drawings` — Thumbnails et exports des dessins Skia
- `voice-notes` — Fichiers audio des notes vocales

---

## Direction artistique

### Ambiance

"Cahier d'étudiant raffiné" — Évoque un carnet Moleskine en papier crème. Encre noire dense pour les titres, encre bleue pour les accents. Zéro effet "tech startup", zéro glassmorphism, zéro gradient. La sophistication vient de la typographie et de l'espace.

### Palette de couleurs

```typescript
// Fondations
bg:           '#F7F3ED'   // Fond parcheminé — partout
surface:      '#F7F3ED'   // Cards au même niveau
surfaceAlt:   '#EDE8E0'   // État actif rail, hover subtil

// Texte
ink:          '#111111'   // Texte principal — noir encre
inkSoft:      '#8A8278'   // Texte secondaire
inkMuted:     '#B0A89C'   // Détails, métadonnées
inkGhost:     '#C8C0B4'   // Placeholders, désactivés
inkDim:       '#D8D0C8'   // Jours hors-mois calendrier

// Accent
blue:         '#3D5AFE'   // Accent principal
blueSoft:     '#8090EE'   // Accent secondaire
blueBg:       '#EEF0FF'   // Fond accent léger
blueBorder:   '#C8D0FF'   // Bordure accent

// Bordures
border:       '#E8E2DA'   // Bordures principales
borderSoft:   '#E0D8CE'   // Bordures légères
borderTask:   '#F0E8E0'   // Séparateur tâches

// Surfaces inversées
dark:         '#111111'   // Cards sombres
darkText:     '#F7F3ED'   // Texte sur fond sombre
darkMuted:    '#666666'   // Texte secondaire sur sombre
darkSubtle:   '#555555'   // Métadonnées sur sombre
```

### NativeWind mapping (`tailwind.config.js`) — noms canoniques

Les noms NativeWind ci-dessous sont les noms canoniques utilisés dans tout le code. Le `theme/colors.ts` exporte les mêmes valeurs pour usage programmatique (animations Reanimated, Skia).

```js
colors: {
  parchment:      '#F7F3ED',
  'surface-alt':  '#EDE8E0',
  ink:            '#111111',
  'ink-soft':     '#8A8278',
  'ink-muted':    '#B0A89C',
  'ink-ghost':    '#C8C0B4',
  'ink-dim':      '#D8D0C8',
  accent:         '#3D5AFE',
  'accent-soft':  '#8090EE',
  'accent-bg':    '#EEF0FF',
  'accent-border':'#C8D0FF',
  border:         '#E8E2DA',
  'border-soft':  '#E0D8CE',
  'border-task':  '#F0E8E0',
  dark:           '#111111',
  'dark-text':    '#F7F3ED',
  'dark-muted':   '#666666',
  'dark-subtle':  '#555555',
}
```

### Typographie

Fonts : **Fraunces** (variable serif) + **DM Sans** (geometric sans)

- Fraunces Black (900) — Titres, chiffres stats
- Fraunces Bold (700) — Sous-titres, noms cours
- Fraunces Light Italic (300) — Accents bleus (unités : "h", "s", "%", ".")
- DM Sans Light (300) — Corps, métadonnées
- DM Sans Regular (400) — Texte courant
- DM Sans Medium (500) — Labels uppercase, eyebrows

### Presets typographiques

Identiques au brief original (heroName, eyebrow, statBig, statLabel, courseTitle, courseDetail, timeHour, timeMin, sectionTitle, sectionAction, monthName, calDay, calHeader, taskText, taskDue, noteCategory, noteTitle, notePreview, dateChip, badgePill, sectionLabel).

### Signature visuelle

1. **Italiques bleues isolées** — Unités rendues en Fraunces Light Italic bleu #3D5AFE (ex: "4**h**", "70**%**", "Mars**.**")
2. **Ghost numbers** — Chiffre répété en filigrane 72px, opacité 4-7%, positionné en bas à droite du bloc
3. **Timeline dots** — Gris #E8E2DA (passé), bleu #3D5AFE (en cours), noir #111 (prochain), reliés par ligne verticale
4. **Cards inversées** — Fond #111, texte clair pour le cours en cours et stat block principal
5. **Logo K°** — "K" en Fraunces Black, "°" en Fraunces Light Italic bleu

### Espacements et rayons

Définis dans `tailwind.config.js` (extend spacing et borderRadius) ET dans `theme/spacing.ts` pour usage programmatique :

```typescript
spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 32 }
radii:   { sm: 6, md: 9, lg: 12, xl: 14, xxl: 16, pill: 20, full: 9999 }
```

### Anti-patterns

- Zéro gradient
- Zéro shadow/elevation
- Zéro border-radius > 20px sur les cards
- Zéro couleur hors palette
- Zéro texte centré (sauf logo rail et jours calendrier)
- Zéro icône filled — stroke only, 1.6px
- Zéro fond #FFFFFF — toujours #F7F3ED
- Zéro police system — Fraunces + DM Sans uniquement

---

## Écrans détaillés

### Dashboard (Home)

**Zone principale** (scroll vertical) :

1. **Header** — Eyebrow "Mercredi · Semaine 11" (DM Sans Medium 9px uppercase #B8B0A4). Titre "Bonjour\nEnzo." en Fraunces Black 48px, le "." final en italic bleue. Chip date (fond #111, texte #F7F3ED, pill radius) + bouton notification en haut à droite.

2. **Stats Band** — ScrollView horizontal, gap 10px. Blocs : Big (130px, fond #111), Med (100px, bordé), Sm (88px), Accent (fond #EEF0FF). Ghost numbers en filigrane. Press : translateY(-2px) + border #111.

3. **Section Divider** — Titre Fraunces Bold 14px + ligne 1px #E8E2DA + action "semaine →" bleu.

4. **Timeline** — Colonne temps (heure Fraunces Bold 13px, minutes DM Sans Light 9px) + ligne verticale 1px + dots (gris/bleu/noir) + cards (border 1px #E8E2DA radius 14px). États : past (opacity 0.38), now (fond #111 + badge "EN COURS"), next (dot noir), later (dot gris). Press : translateX(3px).

5. **Barre progression semaine** — Track 2px #E0D8CE, fill #111, dot bleu au bout.

**Sidebar** : Mini calendrier + tâches rapides (4-5 prochaines) + notes récentes (3 dernières).

### Calendrier

Header : mois Fraunces Bold + année DM Sans Light + flèches. Toggle vue mois/semaine/jour. Import ICS (fichier + URL). Sidebar : détail jour sélectionné + prochains examens.

### Cahiers

Liste des cahiers par matière. Chaque cahier = card avec couleur de couverture, titre, nombre de pages. Tap → éditeur plein écran.

**Éditeur cahier** : Canvas Skia plein écran dans la zone principale. Toolbar en bas : épaisseur trait, couleur (noir #111, bleu #3D5AFE, rouge désaturé #8B4B4B, gomme), undo/redo, templates (blank/ligné/grille/dots), micro (note vocale). Sidebar : miniatures des pages scrollables.

### Tâches

Liste complète : Aujourd'hui, Cette semaine, Plus tard, Terminées (collapsed). SectionDivider entre chaque. Checkbox 14px carré radius 4px. Checked : fond #111, checkmark blanc, texte barré. Swipe gauche → supprimer. Sidebar : filtres par matière, stats completion.

### Stats

Heures cours/semaine (bar chart minimal), tâches complétées, streak jours actifs, progression par matière. Fraunces pour les chiffres, DM Sans pour les labels.

### Pomodoro

Timer circulaire : arc de progression stroke #111 2px sur fond parcheminé. Chiffre Fraunces Black 48px, unité "min" italic bleue. Boutons start/pause/reset : cercles bordés #E0D8CE. Historique sessions.

### Flashcards

Liste decks (DeckCard avec titre, nombre de cartes, progression). Tap → vue révision. Carte flip (Reanimated rotateY). Face avant : fond #111, question Fraunces Bold blanc. Face arrière : fond parcheminé, réponse DM Sans. Boutons difficulté : pills bordées. Algo SM-2.

### Humeur

Grille calendrier heatmap. Chaque jour = carré avec emoji. 5 emojis prédéfinis dans cercles bordés. Note optionnelle DM Sans Light.

### Calculatrice

Calculatrice basique (pas scientifique — YAGNI, l'iPad a déjà la Calculatrice Apple). Grille boutons bordés #E0D8CE radius 12px. Chiffres Fraunces Bold, opérateurs DM Sans Medium bleu. Écran résultat Fraunces Black 38px aligné droite. Opérations : +, -, ×, ÷, %, ±, virgule, AC, backspace.

### Examens

Pas d'écran dédié. Les examens apparaissent dans :
- **Calendrier** : affichés comme événements spéciaux (badge "EXAM" rouge désaturé #8B4B4B)
- **Sidebar calendrier** : section "Prochains examens" avec countdown (J-3, J-7...)
- **Dashboard** : mentionnés dans les stats ("1 examen cette semaine")
- **Création/édition** : via modal `new-event.tsx` avec toggle "Examen" qui ajoute les champs spécifiques (lieu, notes de révision)

### Gestion des matières

Accessible depuis **Settings** (modal). Écran CRUD liste des matières :
- Chaque matière : couleur (picker 8 couleurs prédéfinies), icône (sélection parmi 20 icônes lucide), nom, nom court, professeur
- Ajout : bouton "+" en bas de la liste
- Suppression : swipe gauche + confirmation ("X notes et Y tâches liées seront conservées sans matière")
- Les matières apparaissent aussi comme filtres (chips horizontaux) dans les écrans Tâches, Cahiers, Notes

### Notes vocales — Flow détaillé

1. **Déclenchement** : tap sur icône micro dans la toolbar de l'éditeur cahier
2. **Enregistrement** : bottom sheet s'ouvre avec waveform en temps réel, bouton stop (cercle rouge), compteur de temps. Format : m4a (AAC), durée max : 5 minutes
3. **Upload** : immédiat après stop, vers Supabase Storage bucket `voice-notes`. Indicateur de progression discret
4. **Playback** : la note vocale apparaît comme une pill dans la toolbar/sidebar de la page, tap pour play/pause, mini waveform + durée
5. **Liaison** : automatiquement liée à la page de cahier active via `notebook_page_id`

### PDF Export

Disponible pour les cahiers (dessins Skia) et les notes (TipTap) :
- **Déclencheur** : bouton "Exporter" dans le header de l'éditeur (icône Download)
- **Cahiers** : chaque page Skia est rasterisée en image, assemblée en PDF multipages via `expo-print`
- **Notes** : le contenu TipTap est converti en HTML puis rendu en PDF via `expo-print`
- **Partage** : après génération, share sheet iOS natif (AirDrop, Mail, Files...)

### Settings (modal)

- **Profil** : modifier prénom, lettre avatar
- **Matières** : CRUD matières (voir section ci-dessus)
- **Notifications** : toggle rappels examens (J-1, J-3, J-7), rappels devoirs
- **Données** : exporter toutes les données (JSON), supprimer le compte
- **À propos** : version de l'app, crédits

---

## Animations (Reanimated 3)

| Élément | Animation | Timing |
|---|---|---|
| Stat blocks press | translateY(-2px) + border #111 | 150ms ease-out |
| Timeline card press | translateX(3px) | 150ms ease-out |
| Note/notebook card press | border → #111 | 150ms ease |
| Checkbox toggle | Scale bounce checkmark (1→1.2→1) + fond fade | 200ms spring |
| Task strikethrough | Largeur barré 0%→100% | 300ms ease-in-out |
| Flashcard flip | rotateY 0→180deg | 400ms spring |
| Pomodoro arc | Arc progressif continu | Linear, durée du timer |
| Screen transitions | Shared element quand possible | 350ms cubic-bezier(0.16,1,0.3,1) |
| Pull to refresh | Logo K° rotation légère | 600ms |
| Ghost numbers | Parallax au scroll (30% moins vite) | Continuous |
| Badge "En cours" | Pulse opacité 1→0.7→1 | 2s infinite ease-in-out |
| Bottom sheet | Spring open/close | damping:20, stiffness:150 |

---

## Auth Flow

1. **Splash** : Fond #F7F3ED, logo K° centré, fade in + légère scale
2. **Login/Register** : Email + mdp Supabase Auth. Fond parcheminé, inputs bordés #E0D8CE radius 14px, bouton fond #111 texte #F7F3ED. Titre "Kurso" Fraunces Black + "°" bleu
3. **Onboarding post-inscription** : demander prénom (pour "Bonjour X.") et lettre avatar

---

## Structure des fichiers

```
kurso-expo/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (main)/
│   │   ├── _layout.tsx           # Layout 3 colonnes
│   │   ├── index.tsx             # Dashboard
│   │   ├── calendar.tsx
│   │   ├── notebooks/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── tasks.tsx
│   │   ├── stats.tsx
│   │   ├── pomodoro.tsx
│   │   ├── flashcards/
│   │   │   ├── index.tsx
│   │   │   └── [deckId].tsx
│   │   ├── mood.tsx
│   │   └── calculator.tsx
│   └── (modals)/
│       ├── new-task.tsx
│       ├── new-event.tsx
│       ├── import-ics.tsx
│       └── settings.tsx
├── components/
│   ├── ui/
│   │   ├── Text.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Checkbox.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── IconButton.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Rail.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThreeColumnLayout.tsx
│   ├── dashboard/
│   │   ├── Header.tsx
│   │   ├── StatsBand.tsx
│   │   ├── StatBlock.tsx
│   │   ├── SectionDivider.tsx
│   │   └── TimelineCard.tsx
│   ├── calendar/
│   │   ├── MiniCalendar.tsx
│   │   ├── MonthView.tsx
│   │   ├── WeekView.tsx
│   │   └── DayView.tsx
│   ├── notebooks/
│   │   ├── NotebookCard.tsx
│   │   ├── SkiaCanvas.tsx
│   │   ├── DrawingToolbar.tsx
│   │   └── PageThumbnail.tsx
│   ├── notes/
│   │   ├── NoteCard.tsx
│   │   └── NoteEditor.tsx
│   ├── tasks/
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   ├── flashcards/
│   │   ├── DeckCard.tsx
│   │   └── FlipCard.tsx
│   ├── pomodoro/
│   │   └── TimerCircle.tsx
│   └── mood/
│       ├── MoodPicker.tsx
│       └── MoodHeatmap.tsx
├── lib/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── ics-parser.ts
│   └── utils.ts
├── stores/
│   ├── authStore.ts
│   ├── scheduleStore.ts
│   ├── notebooksStore.ts
│   ├── notesStore.ts
│   ├── tasksStore.ts
│   ├── examsStore.ts
│   ├── flashcardsStore.ts
│   ├── pomodoroStore.ts
│   └── moodStore.ts
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── types/
│   └── index.ts
├── assets/
│   └── fonts/
├── tailwind.config.js
├── global.css
├── app.json
└── tsconfig.json
```

---

## Critères de validation

### Design
- [ ] Fond #F7F3ED partout, jamais #FFF
- [ ] Fraunces pour titres/chiffres, DM Sans pour corps
- [ ] Italiques bleues sur les unités
- [ ] Ghost numbers en filigrane dans stat blocks
- [ ] Timeline avec ligne verticale + dots colorés
- [ ] Cours en cours en fond #111 inversé
- [ ] Rail avec indicateur bleu sur l'onglet actif
- [ ] Zéro shadow, zéro gradient
- [ ] Bordures #E8E2DA / #E0D8CE

### Fonctionnel
- [ ] Auth Supabase (inscription, connexion, session persistante)
- [ ] CRUD cours récurrents (RRULE)
- [ ] Import ICS (fichier + URL)
- [ ] Éditeur cahier Skia avec templates et notes vocales
- [ ] Éditeur notes TipTap (LaTeX = stretch goal, nécessite extension custom KaTeX dans WebView TenTap)
- [ ] Tâches avec animation checkbox/strikethrough
- [ ] Calendrier mois/semaine/jour avec dots événements
- [ ] Dashboard stats dynamiques
- [ ] Flashcards avec algo SM-2
- [ ] Pomodoro timer avec historique
- [ ] Humeur quotidienne avec heatmap
- [ ] Calculatrice basique
- [ ] Examens dans le calendrier avec countdown
- [ ] CRUD matières dans settings
- [ ] Notes vocales (enregistrement + playback dans éditeur cahier)
- [ ] Export PDF (cahiers + notes)
- [ ] Sync entre appareils via Supabase
- [ ] Mode offline lecture seule avec bandeau "Hors ligne"

### Performance
- [ ] Animations 60fps (Reanimated worklets)
- [ ] Fonts chargées avant premier rendu
- [ ] Listes longues avec FlashList
- [ ] Chargement initial < 2s
