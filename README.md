# TransitOps

TransitOps is a full-stack fleet operations platform for managing vehicles, drivers, trip dispatch, maintenance, fuel tracking, and role-based access to operational workflows.

## Overview
TransitOps includes:
- **Frontend**: React + Vite dashboard for operations teams
- **Backend**: Express API with Prisma + PostgreSQL
- **Auth**: JWT-based authentication with role-aware route protection

## Core Features
- User signup/login with roles (`FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`)
- Vehicle and driver management
- Trip dispatching and trip status/expense updates
- Maintenance logging and closure tracking
- Fuel logging and per-vehicle operational cost retrieval
- Dashboard summary statistics

## Tech Stack
### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- ESLint

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT (`jsonwebtoken`)
- Zod validation

## Repository Structure
```text
TransitOps/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── config/
│       ├── features/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── drivers/
│       │   ├── fuel/
│       │   ├── maintenance/
│       │   ├── trips/
│       │   └── vehicles/
│       ├── middleware/
│       └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Backend API Modules
- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET /api/vehicles`, `GET /api/vehicles/available`, `POST /api/vehicles`
- `GET /api/drivers`, `GET /api/drivers/available`, `POST /api/drivers`
- `POST /api/trips/dispatch`, `GET /api/trips`, `PATCH /api/trips/:id/status`, `PATCH /api/trips/:id/expenses`
- `GET /api/maintenance/active`, `POST /api/maintenance`, `PATCH /api/maintenance/:id/close`, `GET /api/maintenance`
- `GET /api/fuel`, `POST /api/fuel`, `GET /api/fuel/:vehicleId/costs`
- `GET /api/dashboard/stats`
- `GET /health`

## Frontend Pages
- Login / Signup
- Dashboard
- Vehicles
- Drivers
- Trip Dispatcher
- Maintenance
- Fuel Logs

## Data Model (Prisma)
Main entities:
- `User`
- `Vehicle`
- `Driver`
- `Trip`
- `MaintenanceLog`
- `FuelLog`

## Prerequisites
- Node.js (LTS)
- npm
- PostgreSQL

## Environment Variables (Backend)
Create `backend/.env`:
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (token signing secret)
- `PORT` (optional, defaults to `5000`)

## Setup & Run
### 1) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Prepare database (from backend)
```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 3) Run backend
```bash
cd backend
node src/server.js
```
Backend runs on `http://localhost:5000` by default.

### 4) Run frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173` by default.

## Frontend Scripts
From `frontend/`:
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Contributors
- Ayush
- Adityaraj
