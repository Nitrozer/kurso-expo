*[English version](README.md)*

# Kurso

Application de gestion de vie étudiante pour iPad. Emploi du temps, prise de notes manuscrites au stylet, tâches, flashcards et suivi de révisions, le tout synchronisé via Supabase.

L'app est pensée iPad d'abord — layout trois colonnes (rail de navigation, zone principale, sidebar contextuelle) — avec un repli sur une barre d'onglets en bas sous 768px de large.

## Fonctionnalités

**Emploi du temps** — Calendrier en vue mois / semaine / jour, import de fichier `.ics`, examens avec compte à rebours, timeline du jour sur le dashboard avec l'état des cours (passé, en cours, à venir).

**Cahiers** — Éditeur de dessin s'appuyant sur PencilKit natif : le stylet écrit, les doigts font défiler et zooment. Modèles de page (vierge, ligné, quadrillé, points) avec marge et perforations. Import d'une photo en fond de page, export PDF, notes vocales rattachées à une page.

**Notes** — Éditeur texte avec titre, matière, tags, et lien optionnel vers un cours de l'emploi du temps. Recherche et filtres par matière ou par tag.

**Tâches** — Regroupées par échéance (aujourd'hui, cette semaine, plus tard, terminées), avec matière et date limite.

**Flashcards** — Decks par matière, révision avec algorithme SM-2 (facteur de facilité, intervalle, prochaine révision).

**Mode révision** — Enchaîne les notes puis les flashcards d'une matière donnée en une seule session, avec barre de progression.

**Gamification** — XP par action, streak quotidien avec jours de grâce, badges de palier.

**Divers** — Statistiques hebdomadaires, calculatrice scientifique, thème sombre, export de toutes les données en JSON.

## Stack

- Expo SDK 55 (workflow prebuild) et React Native 0.83
- Expo Router pour la navigation basée sur les fichiers
- Zustand — un store par domaine métier
- NativeWind 4, doublé d'un dossier `theme/` pour les couleurs et présets typographiques utilisés hors classes Tailwind
- Supabase — auth, PostgreSQL avec RLS, Realtime, Storage
- `expo-pencilkit-ui` pour le canvas manuscrit, `expo-audio` pour les notes vocales, `expo-print` pour l'export PDF
- Fraunces et DM Sans via `@expo-google-fonts`

## Installation

Il faut un build de développement : l'app utilise des modules natifs (PencilKit, MMKV, Reanimated), donc **Expo Go ne fonctionne pas**.

```bash
git clone https://github.com/Nitrozer/kurso-expo.git
cd kurso-expo
npm install
```

Le `postinstall` applique un patch à `expo-pencilkit-ui` (voir [Patch PencilKit](#patch-pencilkit) plus bas).

### Supabase

Créer un projet sur [supabase.com](https://supabase.com), puis appliquer les migrations :

```bash
supabase link --project-ref <votre-ref>
supabase db push
```

Créer ensuite un bucket Storage nommé `voice-notes` pour les enregistrements audio.

### Variables d'environnement

À la racine, dans un fichier `.env` :

```
EXPO_PUBLIC_SUPABASE_URL=https://<votre-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<votre-clé-anon>
```

### Lancer

Les dossiers `ios/` et `android/` ne sont pas versionnés, il faut les générer :

```bash
npx expo prebuild
npm run ios      # ou: npm run android
```

## Structure

```
app/                  écrans (expo-router)
  (auth)/             connexion, inscription
  (main)/             layout 3 colonnes + écrans principaux
  (modals)/           nouvelle tâche, nouvel événement, import ICS, réglages
components/           composants par domaine (calendar, notebooks, notes, tasks, ui…)
stores/               stores Zustand, un par domaine
lib/                  client Supabase, auth, parser ICS, export PDF, helpers
theme/                couleurs, typographie, espacements
supabase/migrations/  schéma SQL
```

Chaque store parle directement à Supabase et met à jour son état local. Il n'y a pas de couche d'abstraction intermédiaire : c'est volontaire, l'app n'a qu'une source de vérité.

Les écrans alimentent la sidebar via un store dédié (`SidebarContext`), ce qui permet à chaque écran de décider de son contenu contextuel sans que le layout ait à les connaître.

## Base de données

Onze tables principales : `profiles`, `subjects`, `schedule_events`, `tasks`, `notes`, `notebooks`, `notebook_pages`, `exams`, `decks`, `flashcards`, `voice_notes`, plus trois tables de gamification (`daily_activity`, `streaks`, `badges`).

RLS est activé partout avec une policy `auth.uid() = user_id`. Un trigger sur `auth.users` crée automatiquement le profil à l'inscription.

La migration initiale crée également `pomodoro_sessions` et `mood_entries`, vestiges de deux fonctionnalités retirées depuis. Elles ne sont plus utilisées par l'app.

Le layout principal souscrit aux changements Realtime sur `tasks`, `schedule_events`, `notes`, `subjects` et `exams` pour la synchronisation multi-appareils, avec un rafraîchissement de secours toutes les 5 minutes.

## Patch PencilKit

`expo-pencilkit-ui` expose le canvas mais pas les réglages nécessaires à un comportement type GoodNotes. `scripts/patch-pencilkit.sh` modifie le fichier Swift du module après installation pour :

- passer `drawingPolicy` à `.pencilOnly` — sinon le doigt dessine au lieu de faire défiler
- monter le zoom maximum à 5x
- rendre le canvas transparent, pour que le modèle de page (lignes, quadrillage, marge) reste visible dessous

Le script restaure aussi les fichiers de build du paquet, que npm supprime parfois.

## Limitations connues

- **Les cahiers sont iOS uniquement.** PencilKit est une API Apple ; l'éditeur de dessin ne fonctionne pas sur Android.
- **Les notifications sont désactivées.** `lib/notifications.ts` ne contient que des stubs : la capability Push Notifications demande un compte Apple Developer payant. Les rappels d'examen et de devoir sont câblés et n'attendent que le retrait des stubs.
- **Les cours récurrents ne sont pas déroulés.** La règle RRULE est bien stockée à l'import ICS, mais l'expansion côté client n'est pas faite : un cours hebdomadaire n'apparaît qu'une fois dans le calendrier.
- **Le thème sombre est partiel.** Seuls le rail et le layout consomment `useColors()` ; la plupart des écrans importent encore la palette claire en dur.
- **Le mode hors ligne est en lecture seule** et ne repose que sur le cache mémoire — il affiche un bandeau, mais les mutations ne sont pas mises en file d'attente.
