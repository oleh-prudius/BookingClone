# DevOps

Containerized setup for BookingClone: PostgreSQL + ASP.NET Core API + React/Vite frontend.

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Orchestrates `db`, `api`, `frontend`. |
| `.env.example` | Template for compose config/secrets. Copy to `.env`. |
| `backend/API/Dockerfile` | Multi-stage .NET 10 build → `aspnet` runtime (port 8080). |
| `frontend/Dockerfile` | Vite build → nginx static serve (port 80). |
| `frontend/nginx.conf` | SPA fallback routing + asset caching. |
| `.github/workflows/ci.yml` | CI: backend build/test, frontend lint/build, docker image build. |

## Quick start

```bash
cp .env.example .env          # then set JWT_KEY (and SMTP if you need email)
docker compose up --build
```

Services:
- Frontend → http://localhost:5173
- API + Swagger → http://localhost:5134/swagger
- PostgreSQL → localhost:5432

The API applies EF Core migrations and seeds roles + the admin account
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`) automatically on startup.

## Running without Docker

Useful for faster iteration, or when you'd rather not spin up an unused local
Postgres just to point at a shared remote database.

**Backend:**

```bash
dotnet run --project backend/API
```

Config is read from `backend/API/appsettings.Local.json` (gitignored, not
committed — same purpose as `.env`/`DATABASE_CONNECTION_STRING` in the Docker
path, but consumed directly by `dotnet run` instead of via compose env vars).
Create it yourself with at least:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<your Postgres or shared/remote connection string>"
  },
  "Jwt": { "Key": "<32+ char signing key>" }
}
```

No manual migration step is needed — the API applies pending EF Core
migrations and seeds roles/admin automatically on every startup, the same as
in Docker (`ScopeCoveredDbInicializer` runs in `Program.cs`).

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Defaults to `http://localhost:5134/api` for the backend if `VITE_API_BASE_URL`
isn't set (see `shared/config/env.ts`), so no extra config is needed if the
backend is running on its default port.

**Sharing data with collaborators (non-Docker path):** put the shared/remote
connection string directly in `backend/API/appsettings.Local.json`'s
`ConnectionStrings:DefaultConnection` — same remote database, different
config file than the Docker path above.

## Notes

- **Config via env vars.** ASP.NET reads `Section__Key` env vars, so
  `ConnectionStrings__DefaultConnection`, `Jwt__Key`, etc. are injected by compose.
  Inside the network the DB host is `db`.
- **Sharing data with collaborators.** By default `api` connects to the local `db`
  container — a fresh, empty database per machine. To have everyone see the same
  users/admins/objects, set `DATABASE_CONNECTION_STRING` in `.env` to a shared/remote
  Postgres connection string (e.g. Neon); `api` will use it instead. The local `db`
  container still starts but is unused — skip it with `docker compose up api frontend`.
  After changing `.env`, recreate the container: `docker compose up -d --build api`.
- **Secrets.** `.env` and `appsettings.Local.json` are gitignored — never commit real
  credentials. `JWT_KEY` must be at least 32 characters.
- **Frontend API URL is build-time.** Vite inlines `VITE_API_BASE_URL` during
  `npm run build`, so it is passed as a Docker build arg. Change it → rebuild the image.
- **CI tests** use Testcontainers, which starts a throwaway PostgreSQL via the runner's
  Docker daemon; no separate service container is needed.

## Common commands

```bash
docker compose up --build -d       # start in background
docker compose logs -f api         # tail API logs
docker compose down                # stop
docker compose down -v             # stop + wipe the database volume
```
