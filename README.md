# Collaborative Weekly Report Management System

Production-ready full-stack web application for educational institutions to collaboratively prepare weekly institutional reports across 17 predefined sections.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Zustand
- Backend: Node.js, Express, TypeScript
- Database: Firebase Firestore
- Authentication: Firebase Auth (Email/Password) + Firebase Admin token verification
- Export: PDF report generation using PDFKit

## Folder Structure

TeamX_College/
- frontend/
- backend/
- database/

## Setup Instructions

### 1) Frontend Setup

1. Open terminal in frontend
2. Install dependencies: npm install
3. Create .env from .env.example
4. Fill all VITE_FIREBASE_* and VITE_API_BASE_URL values
5. Start frontend: npm run dev

### 2) Backend Setup

1. Open terminal in backend
2. Install dependencies: npm install
3. Create .env from .env.example
4. Fill Firebase Admin values:
	 - FIREBASE_PROJECT_ID
	 - FIREBASE_CLIENT_EMAIL
	 - FIREBASE_PRIVATE_KEY
5. Start backend: npm run dev

### 3) Production Build Validation

- Frontend: npm run build
- Backend: npm run build

## Authentication and Authorization

- Firebase Email/Password sign-in and sign-up
- Backend validates ID tokens using Firebase Admin SDK
- Role-based access control:
	- faculty
	- coordinator
	- admin
- Middleware enforces secure route access

## Firestore Data Model

Collections are documented in database/firestore_structure.md:
- users
- reports
- sections
- entries

Sample documents are provided in database/sample_data.json.
Firestore rules template is in database/firebase_rules.txt.

## Implemented API Endpoints

Auth:
- POST /api/auth/login
- GET /api/auth/me

Reports:
- POST /api/reports/create-week
- GET /api/reports/:weekId
- GET /api/reports/
- GET /api/reports/:weekId/export

Sections:
- POST /api/sections/:sectionId/add-entry
- PUT /api/sections/:sectionId/update-entry/:entryId
- DELETE /api/sections/:sectionId/delete-entry/:entryId
- GET /api/sections/:sectionId/:weekId

Admin:
- GET /api/admin/users
- PUT /api/admin/users/:uid/role

## Implemented Core Features

- 17 predefined report sections
- Weekly report isolation by reportId
- Real-time section collaboration using Firestore listeners
- Section-wise dynamic key-value form entries
- Add/Edit/Delete entry flows with modal UX
- Contributor tracking per entry
- Dashboard progress tracking with status badges
	- Green: Completed
	- Yellow: In Progress
	- Red: Pending
- Live report preview screen
- PDF export for finalized report documents

## Deployment

### Frontend (Vercel)

- vercel.json included for SPA route rewrites
- Set VITE_* environment variables in Vercel
- Build command: npm run build
- Output directory: dist

### Backend (Render or Railway)

- Render blueprint available at backend/render.yaml
- Railway can use backend/Procfile
- Required environment variables:
	- PORT
	- FRONTEND_URL
	- FIREBASE_PROJECT_ID
	- FIREBASE_CLIENT_EMAIL
	- FIREBASE_PRIVATE_KEY

## Testing Checklist

### Multi-user Scenario Testing

1. Login with two different users in separate browser sessions
2. Open the same week and same section
3. Add/update/delete entries from one session
4. Verify real-time updates appear in the second session immediately

### Data Persistence Testing

1. Create a weekly report and add entries in multiple sections
2. Refresh browser and re-login
3. Verify entries, section completion, and report status remain intact

### Role Restriction Testing

1. Login as faculty and verify admin routes are blocked
2. Login as coordinator and verify review access
3. Login as admin and verify role update actions are permitted

## Notes

- Frontend bundle currently reports a large chunk warning because Firebase SDK is included in the initial bundle. This does not break functionality.
- For stronger production security, tighten Firestore rules based on custom claims or server-verified role policies.
