# Project: sample-nginx

## Goal
Three-container stack for learning Docker networking:
- **nginx** — serves static files and reverse-proxies `/api/` to the backend
- **backend** — Express API with a PostgreSQL guestbook
- **db** — PostgreSQL with a named volume for persistence

## Current state
- Image: nginx:latest (front), node:20-alpine (API), postgres:16-alpine (db)
- Port: 8080 → nginx:80 (only nginx is published to the host)
- Site mount: `./site` → `/usr/share/nginx/html` (live edits, no rebuild)
- Config mount: `./nginx/default.conf` → `/etc/nginx/conf.d/default.conf`

## Architecture
```
Browser → localhost:8080 → nginx
                              ├─ /           → static files (./site)
                              └─ /api/*      → backend:3000 (Docker network)
                                               └─ db:5432 (PostgreSQL)
```

## Commands
- `docker compose up -d` — start all services
- `docker compose ps` — check status
- `docker compose logs -f nginx` — tail nginx logs
- `docker compose down` — stop (data kept in `pgdata` volume)
- `docker compose down -v` — stop and delete database volume

## What I learned
- Bind mounts are useful for local development — edit `./site` and refresh the browser.
- Only files under the mounted directory are visible to nginx; the Dockerfile COPY is overridden.
- nginx config changes require `docker compose restart nginx` (or reload inside the container).
- Backend port 3000 is not exposed to the host; traffic must go through nginx at `/api/`.

## Next test
- Try adding new static pages under `./site` (e.g. `test2.html` → http://localhost:8080/test2.html)
- Experiment with nginx location blocks or additional backend routes
