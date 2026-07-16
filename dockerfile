FROM nginx:latest

COPY site/index.html /usr/share/nginx/html/index.html
COPY site/style.css /usr/share/nginx/html/style.css

EXPOSE 80