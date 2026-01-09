# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guantes de Oro is a currency exchange (casa de cambio) application for a business in Barranquilla, Colombia. It consists of three packages in an npm workspace: a backend API, a React web app, and a React Native mobile app.

## Commands

### Development

```bash
# From root - start backend (port 3001) and web (port 3000) separately:
npm run backend          # Express API server
npm run web              # Vite React dev server

# Or from individual directories:
cd backend && npm run dev
cd web && npm run dev
cd mobile && npx expo start
```

### Build

```bash
npm run build:web        # Production build for web (outputs to web/dist/)
npm run build:backend    # Backend (no build step, just runs node)
```

### Mobile

```bash
cd mobile
npx expo start           # Launch Expo CLI
npx expo start --android # Android simulator
npx expo start --ios     # iOS simulator
```

## Architecture

### Monorepo Structure

- **backend/**: Express.js REST API with sql.js (SQLite) database
- **web/**: React 18 + Vite SPA with React Router
- **mobile/**: React Native + Expo 50 app with React Navigation

### Backend (`backend/src/`)

```
index.js                 # Express server entry, route registration
config/database.js       # sql.js initialization, schema, seed data
middleware/auth.js       # JWT auth middleware (verificarToken, verificarAdmin)
routes/
  auth.js                # Login, token verification
  divisas.js             # Currency and exchange rate CRUD
  oficinas.js            # Office location CRUD
  citas.js               # Appointment scheduling
```

**Database**: sql.js (chosen for Vercel serverless compatibility). Data stored in `data/guantes.db` locally or `/tmp` on Vercel. The `DatabaseWrapper` class mimics better-sqlite3's synchronous API.

**Tables**: `usuarios`, `divisas`, `tasas_cambio`, `oficinas`, `citas`

### Web (`web/src/`)

```
App.jsx                  # React Router route definitions
components/
  Layout.jsx             # Public pages wrapper (header, nav, footer)
  AdminLayout.jsx        # Admin panel wrapper with auth guard
pages/
  Home.jsx               # Currency converter simulator
  Tasas.jsx              # Exchange rates display
  Oficinas.jsx           # Office locations
  AgendarCita.jsx        # Book appointment
  ConsultarCita.jsx      # Check/cancel appointment by code
  admin/
    Login.jsx            # Admin authentication
    Dashboard.jsx        # Admin overview
    AdminTasas.jsx       # Manage exchange rates
    AdminCitas.jsx       # Manage appointments
    AdminOficinas.jsx    # Manage offices
services/api.js          # API client with auth, divisas, oficinas, citas modules
```

**Routing**: Public routes under `/`, admin routes under `/admin/*`. Vite proxies `/api` to backend at port 3001.

### Mobile (`mobile/`)

Uses bottom tab navigation (Inicio, Tasas, Oficinas, Agendar, Consultar) with a stack navigator for the appointment confirmation screen.

## API Endpoints

**Public**:
- `GET /api/divisas` - List currencies
- `GET /api/divisas/tasas` - All exchange rates
- `POST /api/divisas/convertir` - Calculate conversion
- `GET /api/oficinas` - List offices
- `POST /api/citas` - Create appointment
- `GET /api/citas/consultar/:codigo` - Check appointment
- `GET /api/citas/disponibilidad/:oficina_id/:fecha` - Available time slots

**Protected** (require Bearer token):
- `PUT /api/divisas/tasas/:id` - Update rate
- `GET /api/citas` - List all appointments
- `PUT /api/citas/:id/estado` - Update appointment status
- Office CRUD endpoints

## Conventions

- **Language**: Spanish for database fields, variable names, API responses, and UI text
- **Naming**: snake_case for DB columns (`divisa_origen`, `tasa_compra`), camelCase for JS variables
- **Authentication**: JWT tokens stored in localStorage, 24h expiration
- **Currency codes**: 3-letter ISO codes (USD, EUR, COP, etc.)
- **Appointment codes**: Format `GOYYMM-XXXX` (e.g., GO2401-A3B7)

## Default Admin Credentials

- Email: `admin@guantesdeoro.com`
- Password: `admin123`

## Deployment

Both web and backend have `vercel.json` configs for Vercel deployment. The backend uses `@vercel/node` and stores the SQLite database in `/tmp` (ephemeral on serverless).
