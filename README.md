# Mentonnaise d'assurances — Devis Moto (Email‑only MVP)

Formulaire React (TypeScript + Tailwind) pour obtenir un tarif (sans moteur de tarification, pour l’instant). Les données sont envoyées à un backend AdonisJS v6 qui expédie un email via Resend.

## Stack

- Frontend: Vite + React 18 + TypeScript, Tailwind, React DatePicker, i18n (fr), localStorage autosave
- Backend: AdonisJS v6 (squelette) avec service d’email (Resend SDK)
- Données catalogue: `moto_full.json` (marque → cylindrée → modèles)

## Structure

```
apps/
  frontend/      # SPA Vite/React
  backend/       # API (Adonis v6 style, service email)
packages/
  types/         # Types partagés (FormState, payloads)
```

## Pré‑requis

- Node.js 18+
- Clé API Resend et expéditeur validé (SPF/DKIM)

## Installation

Depuis la racine du dépôt:

```bash
npm install
```

## Lancer le frontend (dev)

```bash
# .env dans apps/frontend (exemple) :
# VITE_API_BASE_URL=http://localhost:3333
npm -w apps/frontend run dev
```

Ouvrir l’URL affichée par Vite (par défaut: http://localhost:5173).

Assurez‑vous que le fichier catalogue est disponible côté front:

```bash
# déjà copié par le projet exemple
apps/frontend/public/moto_full.json
```

## Lancer le backend (dev)

Le backend est un squelette Adonis‑like minimal ici. Vous pouvez l’héberger séparément ou l’adapter dans un vrai projet Adonis.

Variables d’environnement requises:

```
RESEND_API_KEY=...       # clé API Resend
FROM_EMAIL=no-reply@votre-domaine.fr
QUOTE_TO=destinataire@votre-domaine.fr   # recipient qui recevra les devis
```

Exemple d’appel attendu par le front:

- POST `${VITE_API_BASE_URL}/email`
- Body: voir `packages/types/src/index.ts` (interface `EmailQuoteRequest`)

## Fonctionnalités principales

- Étapes: Véhicule → Identité & Déclarations → Conducteur → Email
- Sélecteurs dépendants (Marque → Cylindrée → Modèle) basés sur `moto_full.json`
- Date FR avec React DatePicker (format dd/MM/yyyy), conversion ISO pour l’API
- Labels flottants pour les champs (étape 2), regex code postal FR
- Sauvegarde automatique localStorage par étape
- Transitions entre étapes (slide gauche/droite) + barre de progression avec points

## Scripts utiles

Racine du repo:

```bash
npm run dev          # lance le frontend en dev
npm run build        # build workspaces
npm run typecheck    # vérification TypeScript
```

Frontend (`apps/frontend`):

```bash
npm run dev
npm run build
npm run preview
```

## Déploiement

- Frontend: Vercel/Netlify/Render (Vite static)
- Backend: Render/Railway/Fly.io (exposer /email). Renseigner `VITE_API_BASE_URL` côté front.
- Resend: configurer domaine d’envoi (SPF/DKIM), utiliser une clé API de prod.

## Personnalisation

- Logo: `apps/frontend/public/logo_mentonnaise_assurances.png`
- Styles: `apps/frontend/src/styles.css` (animations, labels flottants, datepicker)
- Traductions: `apps/frontend/src/locales/fr/common.json`

## Limitations MVP

- Pas de moteur de tarification: le bouton final envoie les détails par email
- Pas de base de données ni CRM
- Validations simplifiées côté front; ajoutez des règles back si nécessaire

## Licence

Usage interne/POC. À adapter selon votre contexte.
