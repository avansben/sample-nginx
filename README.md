# sample-nginx 🐳

> A complete three-tier Docker Compose setup demonstrating modern containerized application architecture with static file serving, API proxying, and persistent database storage.

## Overview

This project showcases best practices for:
- **Docker Compose orchestration** with service dependencies
- **Nginx reverse proxy** for routing and static content serving
- **Express.js API** with proper error handling
- **PostgreSQL persistence** with health checks
- **Local development workflow** with bind mounts

### Architecture

```
┌─────────────┐
│   Browser   │
│   :8080     │
└──────┬──────┘
       │ HTTP
       ▼
   ┌───────────────────────────────────┐
   │  nginx (Reverse Proxy)            │
   │  - Static files from ./site       │
   │  - Proxy /api/* → backend:3000    │
   └───────────────┬───────────────────┘
       ┌───────────┴────────────┐
       │                        │
       ▼ (Docker network)       ▼
   ┌─────────────┐         ┌──────────────┐
   │  backend    │────────▶│  PostgreSQL  │
   │  :3000      │  port   │  :5432       │
   │  Express    │  5432   │  guestbook   │
   └─────────────┘         └──────────────┘
```

## Quick Start

### Prerequisites
- Docker & Docker Compose (install [here](https://docs.docker.com/get-docker/))
- ~2 GB disk space
- No services listening on port 8080

### Launch

```bash
# Start all services
docker compose up -d

# Wait a few seconds for PostgreSQL to initialize, then visit:
# → http://localhost:8080
```

### Verify Services

```bash
# Check container status
docker compose ps

# View logs (all services)
docker compose logs -f

# View specific service logs
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f db
```

### Stop Services

```bash
# Stop but keep data
docker compose down

# Stop and delete all data (including database)
docker compose down -v
```

## Project Structure

```
sample-nginx/
├── compose.yaml           # Service orchestration
├── dockerfile             # nginx image
├── nginx/
│   └── default.conf       # nginx configuration (reverse proxy rules)
├── backend/
│   ├── dockerfile         # Node.js image
│   ├── server.js          # Express API server
│   ├── db.js              # PostgreSQL connection pool & startup
│   ├── init.sql           # Database schema initialization
│   └── package.json       # Node dependencies
├── site/                  # Static web files (served by nginx)
│   ├── index.html
│   ├── test.html
│   ├── test2.html
│   ├── 404.html
│   └── style.css
└── README.md
```

## API Endpoints

All requests go through nginx at `http://localhost:8080/api/*`

### `GET /api/hello`
Demo endpoint showing the backend is reachable and database is connected.

**Response:**
```json
{
  "message": "Hello from the backend container",
  "service": "backend",
  "storage": "postgresql",
  "messageCount": 5,
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### `GET /api/health`
Health check for the PostgreSQL connection.

**Response:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

### `GET /api/messages?search=keyword`
Fetch guestbook messages (newest first). Optionally filter by author or text.

**Query Parameters:**
- `search` (optional): Filter by author or message text (case-insensitive)

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "author": "Alice",
      "text": "Great project!",
      "createdAt": "2024-01-15T10:30:45.123Z"
    }
  ]
}
```

### `POST /api/messages`
Create a new guestbook entry.

**Request Body:**
```json
{
  "author": "Bob",
  "text": "This is awesome"
}
```

**Response:** `201 Created` with the new message object.

### `DELETE /api/messages/:id`
Remove a message by ID.

**Response:**
```json
{
  "deleted": 1
}
```

### `GET /api/stats`
Aggregate statistics across all messages.

**Response:**
```json
{
  "totalMessages": 10,
  "uniqueAuthors": 5,
  "latestMessageAt": "2024-01-15T11:15:30.456Z",
  "topAuthors": [
    { "author": "Alice", "count": 4 },
    { "author": "Bob", "count": 3 }
  ]
}
```

## Local Development

### Edit Static Files
Changes to `./site` are live — just refresh the browser. No rebuild needed.

```bash
# Add a new page
echo "<h1>Hello</h1>" > site/hello.html
# Visit http://localhost:8080/hello.html
```

### Edit nginx Config
After modifying `./nginx/default.conf`, restart nginx to apply changes:

```bash
docker compose restart nginx
```

### View Backend Logs
```bash
docker compose logs -f backend
```

### Connect to Database
```bash
docker compose exec db psql -U app -d guestbook

# Inside psql:
\dt                    -- List tables
SELECT * FROM messages; -- View all entries
```

## Key Concepts

### Service Dependencies
- The `backend` service waits for the `db` service to be healthy before starting
- Implemented via `depends_on` with `condition: service_healthy`
- Database health check: `pg_isready -U app -d guestbook`

### Networking
- Services communicate over the internal Docker network using service names (DNS)
- Only `nginx` port 80 is published to the host (8080)
- `backend` port 3000 is only accessible within the network — enforces traffic through nginx

### Persistence
- PostgreSQL data stored in the `pgdata` named volume
- Survives `docker compose down` unless run with `-v` flag
- Initial schema loaded from `backend/init.sql` on first startup

### Bind Mounts
- `./site` → nginx container: live code editing without rebuilds
- `./nginx/default.conf` → nginx container: reverse proxy configuration
- Both marked read-only (`:ro`) for safety

## Security Notes

✅ **Best Practices Implemented:**
- Credentials passed via environment variables, not hardcoded
- Database port not published to host
- API port not published to host
- Nginx runs with read-only filesystem for static assets
- Input validation on API endpoints

⚠️ **For Production:**
- Change default PostgreSQL password in `compose.yaml`
- Use environment file (`.env`) instead of inline credentials
- Add HTTPS/TLS (use proper certificates, not self-signed)
- Implement authentication and rate limiting
- Add CORS headers if needed for cross-origin requests
- Run containers with non-root users
- Use specific image tags (not `latest`)

## Troubleshooting

### Port 8080 Already in Use
```bash
# Find what's using port 8080
lsof -i :8080

# Use a different port in compose.yaml
# Change: ports: - "8080:80"
#     to: ports: - "9090:80"
```

### Database Not Initializing
```bash
# Check database logs
docker compose logs db

# Ensure init.sql is readable
ls -la backend/init.sql
```

### Backend Can't Connect to Database
```bash
# Check backend logs
docker compose logs backend

# Verify environment variables
docker compose config | grep -A 10 "backend:"
```

### Nginx Returns 502 Bad Gateway
```bash
# Ensure backend service is running
docker compose ps backend

# Check backend port is exposed (not published)
docker compose config | grep -A 10 "backend:"
```

## Learning Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Reverse Proxy Guide](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js pg Driver](https://node-postgres.com/)

## License

MIT — Feel free to use this as a learning resource or template for your projects.

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests for improvements.
