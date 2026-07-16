# Base image for the nginx reverse-proxy container.
FROM nginx:latest

# Bake in a minimal default site so the image works without bind mounts.
# In development, compose.yaml overrides /usr/share/nginx/html with ./site.
COPY site/index.html /usr/share/nginx/html/index.html
COPY site/style.css /usr/share/nginx/html/style.css

EXPOSE 80
