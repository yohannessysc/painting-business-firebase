# Painting Business Website (Angular + Firebase)

Starter repository architecture for a painting business web platform using Angular on the frontend and Firebase for hosting, backend APIs, database, and storage.

## Tech Stack

- Frontend: Angular (TypeScript)
- Backend: Firebase Cloud Functions (Node.js + TypeScript + Express)
- Database: Firestore
- Authentication: Firebase Auth
- File Storage: Firebase Storage
- Hosting: Firebase Hosting

## Repository Structure

```text
painting-business-firebase/
  apps/
    web/
      README.md
      src/
        app/
          core/
          features/
          shared/
        environments/
          environment.ts
          environment.prod.ts
  functions/
    src/
      index.ts
      modules/
      utils/
    package.json
    tsconfig.json
  docs/
    architecture.md
  .firebaserc.example
  .gitignore
  firebase.json
  firestore.rules
  firestore.indexes.json
  storage.rules
  README.md
```

## API Endpoints Included

Current starter endpoints in `functions/src/index.ts`:

- `GET /health` - service health check
- `POST /leads` - public quote request intake

Example final endpoint plan:

- `GET /api/leads` (admin)
- `PATCH /api/leads/:leadId` (admin)
- `POST /api/customers` (admin)
- `GET /api/customers` (admin)
- `POST /api/jobs` (admin)
- `GET /api/jobs` (admin)
- `PATCH /api/jobs/:jobId` (admin)

## Firestore Collections

- `leads`: incoming quote requests
- `customers`: converted and managed customer records
- `jobs`: job scheduling and progress tracking
- `users`: admin/staff profile and role mapping

## Local Setup

### 1) Prerequisites

- Node.js 20+
- npm 10+
- Angular CLI (`npm i -g @angular/cli`)
- Firebase CLI (`npm i -g firebase-tools`)
- A Firebase project in Google Cloud

### 2) Clone and enter repo

```bash
git clone <your-repo-url> painting-business-firebase
cd painting-business-firebase
```

### 3) Configure Firebase project

```bash
cp .firebaserc.example .firebaserc
# edit .firebaserc and replace your-firebase-project-id
firebase login
firebase use --add
```

### 4) Install backend dependencies

```bash
cd functions
npm install
npm run build
cd ..
```

### 5) Scaffold Angular app into `apps/web`

Run this from repository root if not already scaffolded:

```bash
ng new apps/web --routing --style=scss --standalone
```

Then install frontend dependencies in `apps/web`:

```bash
cd apps/web
npm install
cd ../..
```

### 6) Configure Angular environments

Update values in:

- `apps/web/src/environments/environment.ts`
- `apps/web/src/environments/environment.prod.ts`

Set:

- `firebase.*` from Firebase project settings
- `apiBaseUrl` from deployed Functions endpoint or emulator endpoint

### 7) Start local emulators

```bash
firebase emulators:start --only functions,firestore,hosting,storage
```

## Deployment Checklist (Production)

### 1) Enable Firebase products

In Firebase Console, enable:

- Authentication
- Firestore
- Functions
- Hosting
- Storage

### 2) Build Angular frontend

```bash
cd apps/web
npm run build -- --configuration production
cd ../..
```

Ensure the Angular build output aligns with `firebase.json` hosting `public` directory (`apps/web/dist/web`).

### 3) Build Functions

```bash
cd functions
npm run build
cd ..
```

### 4) Deploy Firebase resources

```bash
firebase deploy --only hosting,functions,firestore:rules,storage
```

### 5) Validate production

- Open hosting URL and verify public pages load
- Submit a quote form and confirm document is written to `leads`
- Verify Cloud Function logs in Firebase Console
- Validate rules by testing unauthenticated and admin-only operations

### 6) Connect custom domain

- Firebase Console -> Hosting -> Add custom domain
- Add provided DNS records at your domain provider
- Wait for SSL certificate provisioning

### 7) Production hardening

- Add reCAPTCHA to quote/contact forms
- Add API rate limiting for public endpoints
- Restrict admin routes with Firebase Auth role checks
- Enable alerts/log-based monitoring in Google Cloud

## Suggested Next Build Steps

1. Implement Angular pages: Home, Services, Gallery, About, Contact, Quote Request, Admin.
2. Add authentication and role-based route guards for admin area.
3. Add lead-to-customer conversion flow.
4. Add job scheduling and status pipeline.
5. Add gallery image upload workflow to Storage.
