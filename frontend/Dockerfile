FROM nginx:alpine

# Kopieer frontend bestanden
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Kopieer nginx configuratie
COPY nginx.conf /etc/nginx/conf.d/default.conf