# WATC — Plateforme Intelligente d'Évaluation & d'Encadrement PFE

> **We Are Technology Center** — Un écosystème IA qui accompagne l'étudiant
> tunisien depuis son **inscription** jusqu'à son **insertion professionnelle**,
> en passant par une **évaluation unique**, un **parcours PFE sur mesure**, des
> **formations personnalisées** et un **matching d'emploi** intelligent.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![PostgreSQL](https://img.shields.io/badge/Neon-Postgres-00E699) ![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-4285F4) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)

---

## Table des matières

1. [Contexte & vision](#contexte--vision)
2. [Problématique résolue](#problématique-résolue)
3. [Aperçu fonctionnel](#aperçu-fonctionnel)
4. [Architecture & stack technique](#architecture--stack-technique)
5. [Structure du dépôt](#structure-du-dépôt)
6. [Modèle de données (Prisma)](#modèle-de-données-prisma)
7. [Couche IA](#couche-ia)
8. [Parcours utilisateur pas-à-pas](#parcours-utilisateur-pas-à-pas)
9. [Installation locale](#installation-locale)
10. [État d'avancement — ce qui est prêt, ce qui reste](#état-davancement)
11. [Mode DÉMO — raccourcis à remplacer en production](#mode-démo--raccourcis-à-remplacer-en-production)
12. [Feuille de route](#feuille-de-route)
13. [Contribuer / Contact](#contribuer--contact)

---

## Contexte & vision

**WATC (We Are Technology Center)** est un centre technologique tunisien qui
délivre des formations spécialisées et place ses étudiants en stage puis en
emploi chez la société partenaire **We Are Technology Company**.

Le parcours actuel (inscription, évaluation, affectation PFE, suivi,
insertion) est **fragmenté, manuel et peu personnalisé**. Chaque étudiant
vit la même expérience, quelle que soit son niveau réel ou ses ambitions.

### Notre idée

> Construire **une seule plateforme** qui détecte automatiquement le niveau
> réel de chaque étudiant via un **test IA unique et personnalisé**, puis
> l'accompagne jusqu'à sa première embauche grâce à **quatre modules
> intelligents** reliés entre eux (**Profil → Test → PFE → Emploi**), le
> tout avec un module **Formation** transversal qui comble les lacunes en
> temps réel.

L'objectif est triple :

- **Pour l'étudiant** — un parcours *sur mesure*, avec un rapport IA
  personnel, un PFE adapté à ses forces, des formations ciblées sur ses
  lacunes et des offres d'emploi filtrées par compatibilité.
- **Pour WATC** — une administration unifiée (back-office), une
  traçabilité totale des cohortes et une évaluation *objective* des
  candidats.
- **Pour les entreprises partenaires** — un vivier de profils
  pré-évalués et scorés, avec matching automatique vers leurs offres.

---

## Problématique résolue

| Problème initial                                             | Solution WATC                                                                 |
|-------------------------------------------------------------|-------------------------------------------------------------------------------|
| Inscription manuelle, Excel + mails                          | **Onboarding en 4 étapes** + paiement intégré                                 |
| Évaluation subjective (QCM papier, jury)                    | **Test IA généré dynamiquement** selon le profil, évalué par IA               |
| Rapport PDF statique                                         | **Double rapport IA** : version administration + version étudiante motivante  |
| PFE attribué "au hasard"                                     | **PFE pré-rempli** avec Kanban de 7 tâches et sujet adapté à la filière       |
| Étudiants en échec faute de coaching ciblé                  | Module **Formations** qui recommande des cours adaptés aux lacunes détectées  |
| Recherche d'emploi à la main après le diplôme                | Module **Emploi** qui score chaque offre par compatibilité profil × skills   |

---

## Aperçu fonctionnel

### M1 — Authentification & Profil ✅

- Inscription par **email / mot de passe** + OAuth **Google / GitHub /
  LinkedIn / Facebook** (NextAuth.js + adapter Prisma)
- **Onboarding en 4 étapes** :
  1. Coordonnées (téléphone, adresse, date de naissance, diplôme, filière
     Informatique / Électronique)
  2. Compétences techniques par domaine (niveau : *notions / partiel / complet*)
  3. Expérience : GitHub, LinkedIn, CV, centres d'intérêt
  4. Soft skills : français, anglais, forces, points à améliorer
- **Réservation de créneau** + **paiement** (Stripe / D17 mobile / offline)
- Progression du profil en temps réel (barre 0 → 100 %)

### M2 — Test IA personnalisé ✅

- **Gate code admin** (ex. `DEMO2025`) pour démarrer le test
- **Génération IA** (Gemini 2.5 Flash) d'un test **unique par étudiant** :
  - Questions techniques calibrées sur sa filière et ses skills déclarés
  - Section **français** + section **anglais** adaptées à son niveau
  - Section **soft skills** (mises en situation)
- Timer de **30 secondes par question** (timeout géré côté client)
- **Double évaluation IA** à la soumission :
  - Rapport **ADMIN_DETAILED** (JSON complet : scoring par question,
    forces/faiblesses, recommandations pédagogiques)
  - Rapport **STUDENT_SIMPLE** (points forts, axes d'amélioration,
    parcours suggéré, message de motivation personnalisé)
- Tous les tokens Gemini sont **tracés** dans `promptTokens` /
  `completionTokens` pour le monitoring des coûts.

### M3 — PFE (Projet de Fin d'Études) ✅

- Auto-création du PFE dès qu'un test est évalué (mode démo — voir section
  dédiée)
- Sujet **adapté à la filière** : *Développement web moderne* pour
  Informatique, *Système embarqué IoT* pour Électronique
- **Kanban 4 colonnes** (Backlog / En cours / Révision / Terminé) avec 7
  tâches pré-remplies (étude biblio → rédaction rapport → soutenance)
- Fiche encadrant, dates de début/fin, pourcentage d'avancement
- Zone **Livrables** avec notation sur /20 par l'encadrant

### M4 — Formations adaptatives ✅ *(nouveau)*

- Page `/formations` qui **génère dynamiquement** 6 à 8 formations avec
  Gemini, en combinant :
  1. Les **axes d'amélioration** détectés par le rapport IA
  2. Les **centres d'intérêt** déclarés au profil
  3. La **progression naturelle** depuis le niveau actuel
- Chaque carte explique **pourquoi cette formation t'aide** + l'objectif
  ciblé (ex. *"Renforce ton anglais technique détecté comme faible au
  test"*)
- Filtres visuels : format (vidéo / cours / doc / bootcamp / certification),
  niveau, gratuit / payant, durée
- Bouton **Régénérer** pour relancer l'IA avec un nouveau seed

### M5 — Emploi & matching ✅ *(nouveau)*

- Page `/careers` avec 12 offres d'entreprises tunisiennes
  *(Vermeg, Sagemcom, Talan, Instadeep, Actia, Expensya, Keyrus, ST
  Microelectronics, Sofrecom, STEG ER, Jumia, Leoni)*
- **Score de compatibilité 0–100 %** par offre, calculé via :
  - **40 pts** pour la correspondance de filière
  - **60 pts** pour le recouvrement des skills (matching fuzzy)
- Classement automatique de la meilleure à la moins adaptée
- Badges *Nouveau*, *Excellent match*, *CDI / STAGE / FREELANCE*
- Boutons **Postuler / Sauvegarder / Voir détails** (logique à brancher)

### M6 — Back-office admin ✅

Dashboard complet côté administration :

- **/admin/users** : toutes les inscriptions, filtrage par statut de
  profil
- **/admin/codes** : génération / désactivation de codes test (usage
  unique, expiration, compteur)
- **/admin/reports** : rapports IA détaillés par étudiant
- **/admin/pfe** : vue d'ensemble de tous les PFE en cours + avancement
- **/admin/analytics** : KPIs (nombre d'inscriptions, tests passés, scores
  moyens)

---

## Architecture & stack technique

```
┌──────────────────────────────────────────────────────────────┐
│                  Navigateur (React 18 SPA)                   │
│    Server Components · Client Components · Tailwind · shadcn │
└──────────────────────────┬───────────────────────────────────┘
                           │ fetch / server actions
┌──────────────────────────▼───────────────────────────────────┐
│               Next.js 14 App Router (serveur)                │
│    /api/auth   /api/profile   /api/test   /api/formations    │
│    /api/pfe    /api/jobs      /api/booking  /api/payment     │
└───────┬───────────────────┬──────────────────┬───────────────┘
        │ Prisma ORM        │ Gemini SDK       │ Stripe / D17
┌───────▼───────┐   ┌───────▼────────┐   ┌─────▼──────────────┐
│ Neon Postgres │   │ Gemini 2.5     │   │ Stripe / D17 /     │
│ (serverless)  │   │ Flash          │   │ virement (mock)    │
└───────────────┘   └────────────────┘   └────────────────────┘
```

| Couche          | Outil                                   | Rôle                                      |
|-----------------|-----------------------------------------|-------------------------------------------|
| Frontend        | **Next.js 14** (App Router) + React 18  | Rendu hybride SSR + Client                |
| Styling         | **Tailwind CSS** + **shadcn/ui**        | Design system cohérent, accessible        |
| Auth            | **NextAuth.js** + Prisma Adapter        | Sessions JWT, OAuth 4 providers           |
| Base de données | **PostgreSQL** sur **Neon** (serverless)| Stockage relationnel, scale à 0           |
| ORM             | **Prisma 5**                            | Migrations, type-safety, Studio GUI       |
| IA              | **Google Gemini 2.5 Flash**             | Génération + évaluation de tests          |
| Validation      | **Zod**                                 | Schémas côté API et formulaires           |
| Formulaires     | **react-hook-form**                     | Formulaires performants non contrôlés     |
| Paiements       | **Stripe** + **D17** (mobile tunisien)  | CB + mobile money local                   |
| Déploiement     | Vercel (cible) / Node.js local          | Pas encore déployé                        |

---

## Structure du dépôt

```
watc-platform/
├── prisma/
│   ├── schema.prisma          # Modèle complet (17 tables)
│   ├── seed.ts                # Données de démo (domaines, skills, admin)
│   └── migrations/            # Migrations appliquées à Neon
├── public/                    # Assets statiques (logo à ajouter)
├── scripts/
│   └── demo-code.ts           # Crée un code test DEMO2025 (30j, 50 usages)
├── src/
│   ├── app/                   # App Router Next.js
│   │   ├── (auth)/            # /login · /register (layout anonyme)
│   │   ├── admin/             # Back-office (6 pages)
│   │   ├── api/               # Routes REST internes
│   │   │   ├── auth/          # NextAuth [...nextauth]
│   │   │   ├── booking/       # Réservation créneau
│   │   │   ├── formations/    # POST → Gemini → recos formations
│   │   │   ├── payment/       # Webhook Stripe
│   │   │   ├── pfe/           # CRUD tâches Kanban
│   │   │   ├── profile/       # Mise à jour progressive (étapes 1-4)
│   │   │   └── test/          # generate + submit (+ évaluation IA)
│   │   ├── careers/           # Emploi (matching score)
│   │   ├── dashboard/         # Accueil étudiant
│   │   ├── formations/        # Formations adaptatives
│   │   ├── onboarding/        # Stepper profil 4 étapes + paiement
│   │   ├── pfe/               # Kanban + livrables
│   │   └── test/              # Gate + questions + résultats
│   ├── components/            # UI réutilisable (ui/ · pfe/ · test/ · …)
│   ├── lib/
│   │   ├── ai/                # Couche IA (voir plus bas)
│   │   │   ├── client.ts          # Wrapper Gemini SDK
│   │   │   ├── test-generator.ts  # Prompt + parse questions
│   │   │   ├── evaluator.ts       # Évaluation réponses
│   │   │   ├── reports.ts         # Génération des 2 rapports
│   │   │   ├── recommendations.ts # Formations personnalisées
│   │   │   └── prompts.ts         # Prompts système centralisés
│   │   ├── auth/              # Session + options NextAuth
│   │   ├── data/
│   │   │   └── jobs.ts        # Catalogue 12 offres + matchScore()
│   │   └── db/prisma.ts       # Singleton Prisma
│   └── types/                 # Déclarations TypeScript globales
├── .env.example
├── package.json
└── README.md                  # 📍 vous êtes ici
```

---

## Modèle de données (Prisma)

17 tables principales, trois grands blocs :

**👤 Utilisateur & profil**
`User` → `StudentProfile` → `ProfileSkill` → `SkillDomain` → `Skill` ·
`Experience`

**🎓 Parcours académique**
`TestCode` → `TestSession` → `Question` → `Answer` → `Report`

**💼 PFE & insertion**
`PFE` → `Task` → `Deliverable` · `Supervisor` · `Booking` → `Payment`

Chaque table est typée de bout en bout : Prisma → TypeScript → routes API
→ composants React. **Aucune chaîne magique**, aucun `any`.

---

## Couche IA

Tous les appels passent par un **wrapper unique** (`src/lib/ai/client.ts`)
qui expose une fonction `generateText({ system, user, maxTokens, jsonMode })`
et renvoie `{ text, usage: { input, output } }`. Ça permet de :

- Changer de fournisseur en une ligne (on est passé d'Anthropic Claude à
  **Google Gemini** pour rester gratuit)
- Logger automatiquement les tokens dépensés par appel (`promptTokens` /
  `completionTokens` persistés dans `TestSession`)
- Mutualiser la tolérance aux **JSON tronqués** (parseur qui marche même
  si Gemini coupe la réponse en plein milieu d'un tableau — implémenté
  pour les questions de test)

Quatre modules IA indépendants :

| Module             | Fichier                    | Entrée                                   | Sortie                                 |
|--------------------|----------------------------|------------------------------------------|----------------------------------------|
| Génération test    | `ai/test-generator.ts`     | Profil + skills + niveaux langue         | ~20 questions JSON calibrées           |
| Évaluation test    | `ai/evaluator.ts`          | Questions + réponses étudiant            | Score /100 + feedback par question     |
| Rapports doubles   | `ai/reports.ts`            | Résultats évaluation                     | 2 JSON (admin détaillé + étudiant)     |
| Recommandations    | `ai/recommendations.ts`    | Profil + axes d'amélioration + forts     | 6-8 formations gratuites ciblées       |

---

## Parcours utilisateur pas-à-pas

```
Register  →  Onboarding 4 étapes  →  Paiement  →  Code test admin
    │              │                     │                │
    ▼              ▼                     ▼                ▼
  User          Profil              Booking/Payment    TestSession
                                                            │
                                                            ▼
                                                   Gemini génère
                                                   ~20 questions
                                                            │
                                                            ▼
                                                   Réponses + timer 30s
                                                            │
                                                            ▼
                                                   Gemini évalue
                                                            │
                                     ┌──────────────────────┼──────────────────────┐
                                     ▼                      ▼                      ▼
                               Rapport admin         Rapport étudiant        PFE auto-créé
                                     │                      │                      │
                                     ▼                      ▼                      ▼
                              /admin/reports          /test/results             /pfe
                                                            │                      │
                                                            ▼                      ▼
                                                    Formations IA          Kanban 7 tâches
                                                    /formations                    │
                                                                                   ▼
                                                                            Emploi matching
                                                                            /careers
```

---

## Installation locale

### Pré-requis

- Node.js ≥ 18
- npm ou pnpm
- Un compte **Neon** (gratuit — https://neon.tech) ou un Postgres local
- Une clé API **Gemini** (gratuite — https://aistudio.google.com/apikey)

### Étapes

```bash
# 1. Cloner
git clone https://github.com/<votre-username>/watc-platform.git
cd watc-platform

# 2. Installer les dépendances (génère aussi le client Prisma)
npm install

# 3. Copier la config d'environnement
cp .env.example .env
# Puis remplir : DATABASE_URL, NEXTAUTH_SECRET, GEMINI_API_KEY au minimum

# 4. Créer la base
npx prisma migrate dev --name init
npx prisma db seed        # facultatif : domaines de compétences + admin

# 5. Créer un code test de démo
npx tsx scripts/demo-code.ts   # crée le code "DEMO2025" (30j, 50 usages)

# 6. Démarrer
npm run dev
# → http://localhost:3000
```

### Variables d'environnement minimales

| Variable            | Obligatoire | Où l'obtenir                                        |
|---------------------|:-----------:|-----------------------------------------------------|
| `DATABASE_URL`      | ✅          | Neon.tech → Connection string                      |
| `NEXTAUTH_URL`      | ✅          | `http://localhost:3000` en dev                     |
| `NEXTAUTH_SECRET`   | ✅          | `openssl rand -base64 32`                          |
| `GEMINI_API_KEY`    | ✅          | https://aistudio.google.com/apikey                 |
| `GEMINI_MODEL`      | ⚠️          | Par défaut `gemini-2.5-flash`                      |
| `GOOGLE_CLIENT_ID`  | Optionnel   | Google Cloud Console (OAuth)                       |
| `STRIPE_SECRET_KEY` | Optionnel   | https://dashboard.stripe.com                       |

---

## État d'avancement

> ⚠️ **Important** — Ce projet a été développé dans le cadre du
> **WATC Hackathon 2025** avec un **délai très court**. Certaines
> fonctionnalités sont **pleinement opérationnelles**, d'autres sont
> **fonctionnelles mais simplifiées** (mode démo), et quelques-unes sont
> **volontairement laissées pour la v2**. Tout est listé ci-dessous en
> toute transparence.

### ✅ Fonctionnalités opérationnelles

- Inscription / connexion (email + 4 OAuth providers)
- Onboarding complet en 4 étapes avec progression persistée
- Paiement (3 modes : Stripe CB, D17, offline/virement) + webhook Stripe
- Génération et soumission du test IA (Gemini)
- Évaluation IA et double rapport (admin + étudiant)
- Page résultats avec scores, points forts, axes d'amélioration
- Auto-création du PFE post-test (sujet et tâches adaptés à la filière)
- Kanban drag-and-drop des tâches PFE
- Page Formations avec génération IA contextuelle
- Page Emploi avec 12 offres et matching score
- Back-office administration (6 sous-pages : users, codes, reports, PFE,
  analytics)

### 🚧 Fonctionnalités partielles

- **Livrables PFE** — le modèle Prisma + l'UI de consultation existent,
  mais l'upload de fichiers n'est pas branché (il faut Firebase Storage
  ou équivalent S3)
- **Certification** — mentionnée au cahier des charges, non implémentée
  (génération de PDF signé avec QR code + URL publique de vérification)
- **Portail entreprises** — les offres d'emploi sont en *hard-code*
  (catalogue statique). Pas encore de back-office entreprise pour poster
  des offres
- **Notifications** — aucun envoi d'email / SMS n'est branché
  (Resend / Firebase Cloud Messaging)
- **Encadrants** — modèle `Supervisor` présent, affectation manuelle par
  l'admin mais pas encore d'interface dédiée

### ❌ Fonctionnalités non implémentées (v2)

- Soutenance PFE en visio intégrée (Jitsi / LiveKit)
- App mobile (React Native) pour consulter son PFE
- Analytics avancées par cohorte (dashboard Metabase ou similaire)
- Internationalisation (actuellement français uniquement)
- Mode hors-ligne pour passer le test même sans connexion stable

---

## Mode DÉMO — raccourcis à remplacer en production

Pour que la démonstration soit **fluide en 10 minutes** pendant la
présentation, plusieurs garde-fous de production ont été **volontairement
désactivés** ou **court-circuités**. Voici la liste complète de ce qu'il
faudra remettre en place avant un vrai lancement :

### 1. Auto-validation du PFE

📂 `src/app/pfe/page.tsx` (lignes 28-84)

**Démo** : dès qu'un étudiant a un test évalué, son PFE est créé
automatiquement avec un sujet générique et 7 tâches de backlog.

**Production** : c'est l'**admin** qui doit attribuer le PFE via
`/admin/pfe/nouveau`, choisir l'encadrant, valider le sujet proposé par
l'étudiant et **seulement ensuite** mettre le statut `APPROVED`. À
supprimer : tout le bloc `if (!pfe) { … auto-create … }`.

### 2. Gate paiement abaissé

📂 `src/app/onboarding/payment/page.tsx`

**Démo** : `if (!profile || (profile.completionPct ?? 0) < 60)
redirect("/onboarding")` — on laisse passer à 60 %.

**Production** : remonter à **100 %** (tous les 4 formulaires doivent
être complets avant paiement).

### 3. Paiement contourné pour le test

📂 `src/app/api/test/generate/route.ts` (ligne 38)

**Démo** : `if (!hasPaid && process.env.NODE_ENV === "production")` —
donc en dev on démarre le test sans avoir payé.

**Production** : supprimer la condition sur `NODE_ENV` pour bloquer
systématiquement sans paiement validé.

### 4. Code test `DEMO2025`

📂 `scripts/demo-code.ts`

**Démo** : un seul code, 50 usages, 30 jours de validité, que tout le
monde utilise.

**Production** : l'admin génère un code **unique par étudiant** avec
`maxUsage: 1` depuis `/admin/codes`. Pensez à retirer le script de seed
de la CI.

### 5. Offres d'emploi en dur

📂 `src/lib/data/jobs.ts`

**Démo** : 12 offres *hard-codées* (Vermeg, Sagemcom, …) pour montrer le
matching.

**Production** : créer une table `JobOffer` en base, une API
`/api/jobs` pour CRUD, et un portail entreprise (`/company/jobs/new`).
Une intégration **LinkedIn Jobs API** ou **Keejob.com** serait encore
mieux.

### 6. Clé API Gemini partagée

📂 `.env.example`

**Démo** : la clé gratuite est utilisée pour tous les étudiants, ce qui
consomme le quota commun.

**Production** : passer au **tier payant** de Gemini ou utiliser plusieurs
clés en round-robin avec un compteur de quota par étudiant. Mettre en
place du **cache** (Redis) pour les prompts système identiques.

### 7. Pas de rate limiting

Aucune route n'est protégée contre le spam.

**Production** : intégrer **Upstash Ratelimit** ou
`@vercel/kv`. Cible : 10 req / min sur `/api/test/generate` et
`/api/formations` (ces routes coûtent de l'argent à chaque appel).

### 8. Fichiers CV pas encore persistés

📂 `src/app/onboarding` (étape 3)

**Démo** : le champ `cvUrl` est accepté comme une string libre.

**Production** : brancher **Firebase Storage** ou **UploadThing**,
valider le format PDF, limiter à 5 Mo.

### 9. `NEXT_PUBLIC_APP_URL`

Actuellement à `http://localhost:3000`. À remplacer par l'URL Vercel en
prod (utilisée dans les webhooks Stripe et les liens d'email).

### 10. Seed de l'admin par défaut

📂 `prisma/seed.ts` crée un compte admin avec un mot de passe connu.

**Production** : changer le mot de passe **dès le premier login**, ou
mieux, le générer aléatoirement et l'envoyer par email au vrai admin
WATC.

---

## Feuille de route

### Court terme (2–4 semaines)

- [ ] Upload de fichiers (Firebase Storage ou UploadThing)
- [ ] Envoi d'emails transactionnels (Resend)
- [ ] Rate limiting sur les routes IA
- [ ] Intégration Stripe en production (clé live + webhook signé)
- [ ] Suppression complète du mode démo (voir section ci-dessus)
- [ ] Déploiement Vercel + DNS `watc.tn`

### Moyen terme (1–3 mois)

- [ ] Portail entreprises (création d'offres d'emploi)
- [ ] Module Certification avec PDF signé + QR code
- [ ] Interface encadrant dédiée (mes PFE, validation de livrables,
      notation)
- [ ] Dashboard analytics avancé (Metabase embarqué)
- [ ] i18n français / arabe / anglais

### Long terme (3–6 mois)

- [ ] App mobile React Native (consultation PFE + notifications push)
- [ ] Soutenance en visio intégrée (LiveKit)
- [ ] Matching IA avancé (LLM embeddings plutôt que règles de scoring)
- [ ] Marketplace de formations avec paiement à la pièce

---

## Contribuer / Contact

Ce projet a été réalisé dans le cadre du **WATC Hackathon 2025**.

- 💡 **Idée originale** — équipe WATC (cahier des charges disponible sur
  demande)
- 👩‍💻 **Développement** — équipe étudiants
- 🤖 **Assistance IA** — développement accéléré par Claude (Anthropic) et
  Gemini (Google)

Pour toute question : ouvrez une **issue GitHub** ou contactez l'équipe.

---

> **"Créer un écosystème IA autonome qui accompagne l'étudiant de son
> inscription jusqu'à son insertion professionnelle."**
>
> — Vision WATC 2025
