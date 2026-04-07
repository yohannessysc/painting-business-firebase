# Architecture Blueprint

## Stack

- Frontend: Angular (TypeScript)
- Backend: Firebase Cloud Functions (Node.js + TypeScript + Express)
- Database: Firestore
- Auth: Firebase Authentication
- File storage: Firebase Storage
- Hosting: Firebase Hosting

## Top-level structure

- `apps/web`: Angular frontend application
- `functions`: HTTP API and server-side business logic
- `firestore.rules`: Firestore access rules
- `storage.rules`: Storage access rules
- `firebase.json`: Firebase project configuration

## Frontend routes

- `/`: Home
- `/services`: Painting services
- `/cleaning`: Cleaning services
- `/process`: Service process
- `/projects`: Project showcase
- `/contact`: Lead intake form
- `/admin`: Admin lead management

## API endpoints

- Public endpoints:
  - `GET /health` and `GET /api/health`: API health check
  - `GET /slots` and `GET /api/slots`: available consultation slots
  - `POST /leads` and `POST /api/leads`: lead intake with validation and rate limiting
  - `POST /estimates` and `POST /api/estimates`: quick estimate range calculator
- Admin endpoints (Firebase Auth + admin role required):
  - `GET /admin/leads` and `GET /api/admin/leads`
  - `PATCH /admin/leads/:leadId/status` and `PATCH /api/admin/leads/:leadId/status`
  - `POST /admin/seed` and `POST /api/admin/seed`

## Primary collections

- `leads`: Quote requests from public site
- `customers`: Converted customer records
- `jobs`: Scheduled and active work orders
- `users`: Admin and staff authorization profiles

## Deployment model

- Feature branches deploy to Firebase Hosting preview channels via GitHub Actions.
- `main` branch deploys to production hosting and functions.
- This separation keeps in-progress branch work hidden from production users.
