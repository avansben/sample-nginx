# Project: sample-nginx

## Goal
Serve a static site with nginx in Docker.

## Current state
- Image: nginx:latest
- Port: 8080 -> 80
- Site mount: ./site -> /usr/share/nginx/html
- Config mount: ./nginx/default.conf -> /etc/nginx/conf.d/default.conf

## Commands
- docker compose up -d
- docker compose ps
- docker compose logs -f nginx
- docker compose down

## What I learned
- Bind mounts are useful for local development.
- nginx config changes may require container restart or reload.

## Next test
Add a reverse proxy to a backend container.