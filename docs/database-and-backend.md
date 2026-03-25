# Database Schema and Backend Design

## Backend Stack

- Runtime: Firebase Cloud Functions (Node.js 20, TypeScript)
- API Framework: Express
- Database: Firestore
- Entry point: `functions/src/index.ts`
- Exposed function: `api`

## Current Public Endpoints

- `GET /health` and `GET /api/health`
- `POST /leads` and `POST /api/leads`

The API accepts both prefixed and non-prefixed paths for flexibility.

## Lead Payload Contract

`POST /api/leads`

Required fields:

- `fullName: string`
- `email: string`
- `phone: string`
- `serviceType: string`

Optional fields:

- `message: string`

Server-generated fields:

- `status: "new"`
- `source: "website"`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

## Firestore Collections

### `leads`

Purpose: incoming quote and contact requests from website forms.

Example document:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "(000) 000-0000",
  "serviceType": "Interior Painting",
  "message": "3-bedroom repaint",
  "status": "new",
  "source": "website",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### `customers`

Purpose: converted leads and active customer records (admin write/read).

### `jobs`

Purpose: scheduling and job execution tracking (admin write/read).

### `users`

Purpose: role profile data used for admin authorization checks.

### `gallery`

Purpose: project portfolio metadata.

## Security Model

Firestore rules currently allow:

- Public create on `leads`
- Admin-only read/update/delete on `leads`
- Admin-only access for `customers`, `jobs`, `gallery`
- User self-read for own `users/{uid}` profile

## Hosting and API Routing

`firebase.json` rewrites:

- `/api/**` -> Cloud Function `api`
- `**` -> `/index.html` (SPA fallback)

This enables same-origin API calls from the web app to `/api/leads` when running via Firebase Hosting emulator or deployed Hosting.
