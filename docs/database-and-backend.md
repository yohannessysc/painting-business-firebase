# Database Schema and Backend Design

## Backend Stack

- Runtime: Firebase Cloud Functions (Node.js 20, TypeScript)
- API Framework: Express
- Database: Firestore
- Entry point: `functions/src/index.ts`
- Exposed function: `api`

## Current Public Endpoints

- `GET /health` and `GET /api/health`
- `GET /slots` and `GET /api/slots`
- `POST /leads` and `POST /api/leads`
- `POST /estimates` and `POST /api/estimates`

The API accepts both prefixed and non-prefixed paths for flexibility.

## Admin Endpoints

- `GET /admin/leads` and `GET /api/admin/leads`
- `PATCH /admin/leads/:leadId/status` and `PATCH /api/admin/leads/:leadId/status`
- `POST /admin/leads/sync` and `POST /api/admin/leads/sync`
- `POST /admin/seed` and `POST /api/admin/seed`

Admin routes require a valid Firebase ID token and `users/{uid}.role = "admin"`.

## Lead Payload Contract

`POST /api/leads`

Required fields:

- `fullName: string`
- `email: string`
- `phone: string`
- `serviceType: string`
- `consultationType: string`
- `preferredDate: string` (ISO date)
- `preferredTimeSlot: string`

Conditional service detail fields (required for `Painting`, `Cleaning`, and `Painting + Cleaning`):

- `servicePropertyType: "Residential" | "Commercial"`
- `serviceSquareFootage: string` (numeric, 100-200000)
- `serviceDetail: string`
  - painting services: `Interior`, `Exterior`, `Interior + Exterior`
  - cleaning services: `One-Time`, `Weekly`, `Bi-Weekly`, `Monthly`

Optional fields:

- `message: string`
- `website: string` (honeypot, must be empty)

Server-generated fields:

- `status: "new"`
- `customerId?: string` (set when lead is converted)
- `jobId?: string` (set when lead is scheduled)
- `convertedAt?: Timestamp`
- `source: "website"`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`

## Lead Conversion Sync

- When admin sets a lead to `scheduled`:
  - `customers/{lead-<leadId>}` is created/updated
  - `jobs/{lead-<leadId>-job}` is created/updated
  - lead doc receives `customerId`, `jobId`, `convertedAt`
- When admin sets a lead to `closed`:
  - `customers/{lead-<leadId>}` is created/updated
  - lead doc receives `customerId`, `convertedAt`

Backfill endpoint for existing data:

- `POST /api/admin/leads/sync`
  - Finds existing `scheduled` and `closed` leads missing links
  - Creates missing `customers`/`jobs` records deterministically
  - Supports `dryRun: true` to preview changes before writing

## Lead Validation And Protection

- Input length limits for name, email, phone, and message.
- Email and phone format validation.
- Control character filtering.
- Date and slot consistency checks.
- In-memory per-IP rate limiting for lead submissions.
- JSON payload size limit.
- Honeypot field support for basic bot filtering.

## Firestore Collections

### `leads`

Purpose: incoming quote and contact requests from website forms.

Example document:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "(000) 000-0000",
  "serviceType": "Painting + Cleaning",
  "serviceDetails": {
    "propertyType": "Residential",
    "squareFootage": 1800,
    "detailType": "paintingScope",
    "detailValue": "Interior + Exterior"
  },
  "consultationType": "Virtual Consultation",
  "preferredDate": "2026-04-12",
  "preferredTimeSlot": "10:00 AM - 12:00 PM",
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
