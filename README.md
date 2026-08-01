# Triply

A Booking.com-inspired hotel booking platform, built as a full-stack portfolio
project: search and filter hotels, view details and reviews, book a room, and
manage bookings, favorites and payment methods — plus an admin panel for
managing hotels, rooms and users.

## Tech stack

**Backend** — ASP.NET Core 10, EF Core (PostgreSQL), MediatR (CQRS), ASP.NET
Identity + JWT, Serilog, rate limiting.

**Frontend** — React 19, TypeScript, Vite, Ant Design, Refine (admin panel),
Feature-Sliced Design.

**Observability** — Sentry (error monitoring, backend + frontend), self-hosted
Umami (privacy-friendly analytics).

## Features

- Hotel search with filters (destination, dates, guests, star rating,
  property type, price) and sorting
- Hotel details: photo gallery, amenities, map, guest reviews
- Booking flow with a mock payment step
- Favorites, booking history, profile & saved payment methods
- Admin panel for hotels, rooms, bookings, and reference data
- JWT auth with email confirmation, password reset, and rate-limited auth
  endpoints
- Global error handling (error boundary + toast notifications) and an
  accessible, keyboard-navigable UI

## Architecture

The backend follows **Clean Architecture**, organized around CQRS
(MediatR commands/queries per feature):

```
backend/
├── Domain/          Entities, repository interfaces, Result/Error. No external deps.
├── Application/     Features/<Entity>/{Commands,Queries}, DTOs, mapping.  Depends on Domain.
├── Infrastructure/  EF Core DbContext, repositories, migrations, DB seeding. Depends on Domain.
└── API/             Controllers, middleware, rate limiting, composition root.
```

Dependency direction (outer depends on inner, never the reverse):
`API → Application → Domain ← Infrastructure`

The frontend follows **Feature-Sliced Design**:

```
frontend/src/
├── app/        bootstrap, providers, global styles, error boundary
├── pages/      route-level screens
├── widgets/    composite UI blocks (header, footer, hotel map)
├── features/   user-facing features (auth, search, favorites)
├── entities/   business entities (hotel, booking, user)
└── shared/     api client, ui kit, lib, config, assets — no business logic
```

Path aliases (`vite.config.js`): `@`, `@app`, `@pages`, `@widgets`,
`@features`, `@entities`, `@shared`.

## Getting started

Clone the repo:

```bash
git clone git@github.com:oleh-prudius/BookingClone.git
cd BookingClone
```

The fastest way to run everything (API + frontend + PostgreSQL) is Docker:

```bash
cp .env.example .env   # then set JWT_KEY (and SMTP if you need email)
docker compose up --build
```

- Frontend → http://localhost:5173
- API + Swagger → http://localhost:5134/swagger
- PostgreSQL → localhost:5432

The API applies EF Core migrations and seeds roles + an admin account
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`) automatically on startup.

For running the backend/frontend directly without Docker (faster iteration,
or pointing at a shared remote database), see **[DEVOPS.md](DEVOPS.md)**.

## Environment variables

All variables are documented inline in **[.env.example](.env.example)** —
database connection, JWT key, frontend/API URLs, the seeded admin account,
and optional SMTP settings for outgoing email.

## Tests

```bash
cd backend && dotnet test          # xUnit, uses Testcontainers (needs Docker)
cd frontend && npm run lint        # ESLint
cd frontend && npm run test        # Vitest + React Testing Library
cd frontend && npm run test:e2e    # Playwright (needs the app running, see docker-compose.yml)
```

## More docs

- **[DEVOPS.md](DEVOPS.md)** — Docker setup, running without Docker, env
  vars, migrations, common commands
