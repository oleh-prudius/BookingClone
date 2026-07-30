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
| `.github/workflows/ci-backend.yml` | CI: backend build/test, docker image build. |
| `.github/workflows/ci-frontend.yml` | CI: frontend lint/build, docker image build, E2E tests. |
| `docker-compose.prod.yml` | Production overlay: Caddy reverse proxy (HTTPS), scheduled DB backups, no directly-exposed service ports. |
| `deploy/Caddyfile` | Reverse proxy routing (`/api`, `/hubs`, `/uploads` → api; everything else → frontend) + automatic Let's Encrypt TLS. |

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

## Production deployment

Requires a real domain pointed (A record) at the server's IP — Caddy needs
this to request a Let's Encrypt certificate. Deploying by IP only isn't
supported by this setup (no cert authority will issue for a bare IP); drop
the `docker-compose.prod.yml` overlay and use the base `docker-compose.yml`
directly (over plain HTTP) if a domain genuinely isn't available.

```bash
cp .env.example .env
# Set real (non-placeholder) values for: POSTGRES_PASSWORD, JWT_KEY,
# ADMIN_PASSWORD, and DOMAIN=your.domain.example — see .env.example.

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

This starts everything behind Caddy on ports 80/443 (HTTP requests
redirect to HTTPS automatically); `db`, `api` and `frontend` no longer
publish ports directly to the host. Uploaded hotel/avatar photos persist
in the `api_uploads` named volume across container recreation.

If pointing at a managed/remote Postgres (e.g. Neon) via
`DATABASE_CONNECTION_STRING` instead of the local `db` container, that
provider already handles backups — scale the bundled backup job to zero:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --scale db-backup=0
```

### Backups

The `db-backup` service (only relevant when using the local `db`
container, see above) runs `pg_dump` once a day and prunes old dumps to a
retention policy of 7 daily / 4 weekly / 6 monthly backups, stored in the
`db_backups` named volume as gzipped SQL.

List available backups:

```bash
docker compose exec db-backup ls -la /backups/daily /backups/weekly /backups/monthly
```

### Restore runbook

1. Stop the API so it stops writing to the database:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml stop api
   ```
2. Pick a backup file and restore it (the backup image ships a helper script):
   ```bash
   docker compose exec db-backup sh -c 'ls /backups/daily'
   docker compose exec db-backup /restore.sh <filename>
   ```
3. Restart the API:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml start api
   ```

### Rollback runbook (bad deploy)

```bash
git log --oneline -10                 # find the last known-good commit/tag
git checkout <good-commit>
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

EF Core migrations only ever add forward; rolling back application code
while a *newer* migration has already run against the database is only
safe if that migration didn't drop/rename anything the older code reads —
check the migration before rolling back across one.

## Common commands

```bash
docker compose up --build -d       # start in background
docker compose logs -f api         # tail API logs
docker compose down                # stop
docker compose down -v             # stop + wipe the database volume
```
