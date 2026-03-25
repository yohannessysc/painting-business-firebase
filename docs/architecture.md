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

## API starter endpoints

- `GET /health`: API health check
- `POST /leads`: Public quote lead intake

## Primary collections

- `leads`: Quote requests from public site
- `customers`: Converted customer records
- `jobs`: Scheduled and active work orders
- `users`: Admin and staff authorization profiles
