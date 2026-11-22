# 🇬🇧 English Learning — Learn • Practice • Speak

> **Plateforme web moderne, interactive et gamifiée pour l'apprentissage de l'anglais**  
> Inspirée de la pédagogie active (style Duolingo & Baamboozle), avec retours immédiats en mèmes / stickers, synthèse vocale native (TTS), progression CECRL (A1 à C1) et synchronisation PostgreSQL.

---

## 📑 Sommaire

- [Aperçu du Projet](#-aperçu-du-projet)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Architecture & Technologies](#-architecture--technologies)
- [Structure du Projet](#-structure-du-projet)
- [Prérequis](#-prérequis)
- [Installation & Démarrage Rapide](#-installation--démarrage-rapide)
- [Base de Données PostgreSQL](#-base-de-données-postgresql)
- [API Endpoints](#-api-endpoints)
- [Comptes de Démonstration](#-comptes-de-démonstration)
- [Déploiement sur GitHub](#-déploiement-sur-github)

---

## 🌟 Aperçu du Projet

**English Learning** transforme l'apprentissage de la grammaire et du vocabulaire anglais en une expérience ludique et engageante :
- 🎨 **Interface EdTech Moderne & Élégante** : Design inspiré des applications mobiles éducatives de référence avec animations CSS fluides (shimmer, flottement 3D, particules).
- 📱 **Page d'authentification Side-by-Side** : Hero mascotte 3D haute qualité à gauche et formulaire dynamique (Connexion / Inscription / Mode Invité) à droite.
- 😂 **Gamification & Système de Mèmes** : Chaque réponse validée déclenche un sticker dynamique (PNG/GIF/MP4) selon la précision de la réponse (*Correct*, *Close*, *Wrong*).
- 🎙️ **Laboratoire de Prononciation & Flashcards** : Audio natif via la Web Speech API pour écouter la prononciation britannique/américaine de chaque mot et phrase.

---

## 🚀 Fonctionnalités Principales

### 1. 🔐 Authentification & Profils
- **Page dédiée `login.html`** : inscription / connexion / mode invité. Aucun profil, score, classement ni bouton de déconnexion n'est affiché pendant l'authentification.
- La barre supérieure de l'application suit automatiquement le compte connecté (nom + points) ; une session absente renvoie vers `login.html`.
- Connexion sécurisée avec mot de passe haché (`bcryptjs`).
- Inscription rapide avec validation en direct et bouton d'affichage/masquage du mot de passe (👁️).
- Mode **"Continue as Guest"** en 1 clic pour tester l'application sans créer de compte.
- Auto-remplissage rapide du compte démo (`MemeMaster`).

### 2. 📊 Progression par Niveaux CECRL (A1 à C1)
- Filtres dynamiques par niveau standard européen :
  - **A1 Débutant** (Présent simple, survie voyage)
  - **A2 Élémentaire** (Verbes irréguliers, routines)
  - **B1 Intermédiaire** (Slang Gen-Z, vocabulaire usuel)
  - **B2 Avancé** (Idiomes animaliers, faux-amis)
  - **C1 Expert** (Grammaire avancée, nuances professionnelles)
  - **MISC — Silly Stuff 🤪** (Slang Gen-Z, mèmes, idioms animaliers, culture pop — ce n'est PAS un niveau CECRL)
- Barre de progression dynamique calculée en temps réel selon les thèmes complétés.

### 3. 🎯 3 Formats d'Exercices Interactifs
- **QCM (Choix Multiples)** : Options tactiles avec retour haptique visuel.
- **Phrases à Trous (Fill in the Blank)** : Champ de saisie avec **algorithme de Levenshtein** (tolérance intelligente aux fautes de frappe et synonymes proches).
- **Vrai / Faux (True / False)** : Cartes interactives instantanées.

### 4. 📚 Mini-Cours de Grammaire Dédiés
- Fiches de révision intégrées avant chaque quiz avec explications claires et exemples audio cliquables.

### 5. 🏆 Classement Mondial & Notifications
- Tableau des scores (*Leaderboard*) sauvegardé en base de données.
- Centre de notifications interactif avec badge de messages non lus.
- Effets sonores rétro 8-bit générés nativement via la **Web Audio API** (zéro fichier lourd requis).

---

## 🛠️ Architecture & Technologies

| Couche | Technologies Utilisées |
|---|---|
| **Frontend** | Vanilla JavaScript (ES6+), HTML5, CSS3, Tailwind CSS (CDN), FontAwesome 6 |
| **Backend API** | Node.js, Express.js |
| **Base de Données** | PostgreSQL (driver `pg`), Schéma relationnel avec clés étrangères |
| **Sécurité** | `bcryptjs` (hachage de mots de passe), variables d'environnement `dotenv` |
| **Audio & Effets** | Web Audio API (synthétiseur sonore), Web Speech API (TTS natif), Canvas Confetti |

---

## 📁 Structure du Projet

```text
project-english/
├── index.html               # Coquille modulaire de l'application (partials injectés)
├── login.html               # Page d'authentification dédiée (sign in / sign up / guest)
├── styles.css               # Feuille de style partagée (extraite de l'ancien index.html)
├── server.js                # Serveur API REST Express + connexion PostgreSQL
├── schema.sql               # Schéma SQL de la base de données (tables, thèmes, questions)
├── package.json             # Configuration du projet Node.js et dépendances
├── .env.example             # Modèle des variables d'environnement de configuration
├── .gitignore               # Fichiers exclus du versionnement Git (node_modules, .env)
├── README.md                # Documentation professionnelle du projet
│
├── js/                      # Scripts frontend modulaires
│   ├── loader.js            # Charge les partials HTML puis démarre l'application
│   ├── login.js             # Logique de login.html (auth + redirection)
│   ├── app.js               # Moteur de quiz / audio / progression (session uniquement)
│   └── tailwind-config.js   # Configuration Tailwind partagée
│
├── partials/                # Vues HTML modulaires injectées dans index.html
│   ├── header.html          # Barre supérieure (contrôles visibles si connecté)
│   ├── dashboard.html       # Tableau de bord + filtres CEFR / MISC
│   ├── quiz.html            # Arène de quiz
│   ├── results.html         # Écran de résultats
│   └── modals.html          # Modales (une seule copie chacune)
│
├── assets/                  # Ressources visuelles et multimédias
│   ├── mascot_hero.jpg      # Illustration mascotte 3D (haute qualité, sans statut)
│   ├── mascot_character.png # Mascotte détourée
│   └── stickers/            # Mèmes et GIFs de réaction
│       ├── correct/         # Stickers pour réponses correctes (+100 pts)
│       ├── close/           # Stickers pour réponses proches (+50 pts)
│       └── wrong/           # Stickers pour mauvaises réponses
│
└── scripts/                 # Scripts utilitaires d'alimentation
    ├── setup_levels.js      # Initialisation des niveaux CECRL
    ├── build_exercises.js   # Générateur d'exercices
    └── add_new_themes.js    # Script d'ajout de nouveaux thèmes
```

---

## ⚙️ Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé sur votre machine :
- **Node.js** (version 18 ou supérieure recommandée) : [nodejs.org](https://nodejs.org/)
- **PostgreSQL** (version 14 ou supérieure) : [postgresql.org](https://www.postgresql.org/)
- **Git** : [git-scm.com](https://git-scm.com/)

---

## 🚀 Installation & Démarrage Rapide

### 1. Cloner le dépôt
```bash
git clone https://github.com/ilyas260/ENGLISH-PROJECT.git
cd ENGLISH-PROJECT
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer l'environnement
Dupliquez le fichier d'exemple et renseignez vos identifiants PostgreSQL :
```bash
cp .env.example .env
```
Éditez le fichier `.env` :
```ini
PORT=3000
DATABASE_URL=postgres://postgres:votre_mot_de_passe@localhost:5432/baamboozle_english
```

### 4. Initialiser la Base de Données
Créez la base de données dans PostgreSQL puis importez le schéma :
```bash
# Dans psql ou votre outil PostgreSQL préféré (pgAdmin, DBeaver)
psql -U postgres -d baamboozle_english -f schema.sql
```

### 5. Lancer l'application
```bash
node server.js
```
👉 Ouvrez ensuite votre navigateur sur : **`http://localhost:3000`** (redirection automatique vers `login.html` si aucune session n'existe).

---

## 🗄️ Base de Données PostgreSQL

Le schéma relationnel (`schema.sql`) est structuré autour de 4 tables principales :

1. **`users`** : Comptes apprenants (nom d'utilisateur, email, mot de passe chiffré, score total cumulé).
2. **`themes`** : Modules d'apprentissage (titre, description, niveau CECRL, icône, couleur).
3. **`exercises`** : Banque de questions liées aux thèmes (type, énoncé, choix JSON, réponse correcte, variantes acceptées).
4. **`scores`** : Historique des sessions de quiz par utilisateur pour l'établissement du classement.

---

## 🔌 API Endpoints

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Vérification de l'état du serveur et de PostgreSQL |
| `POST` | `/api/auth/register` | Création d'un nouveau compte apprenant |
| `POST` | `/api/auth/login` | Connexion et authentification utilisateur |
| `GET` | `/api/themes` | Récupération de tous les thèmes avec compteurs |
| `GET` | `/api/themes/:id/exercises` | Récupération des exercices d'un thème |
| `POST` | `/api/scores/save` | Sauvegarde du score d'une session de jeu |
| `GET` | `/api/leaderboard` | Top 10 des meilleurs scores mondiaux |
| `GET` | `/api/stickers` | Liste dynamique de tous les mèmes/stickers disponibles |

---

## 💡 Comptes de Démonstration

Pour tester immédiatement l'application sans inscription manuelle :

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| **Compte Démo** | `MemeMaster` | `123456` |
| **Accès Invité** | Cliquez sur *"Continue as Guest"* (sans mot de passe) |

---

## 📤 Déploiement & Mises à Jour Git

Pour envoyer vos modifications vers le dépôt GitHub :

```bash
git add .
git commit -m "Mise à jour: description de vos changements"
git push origin main
```

---

## 📄 Licence & Auteurs

- **Auteur** : [ilyas260](https://github.com/ilyas260)
- **Projet** : Application Éducative d'Anglais Gamifiée
- **Statut** : En développement actif 🚀
