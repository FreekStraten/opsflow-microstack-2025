FROM nginx:alpine

# Copy frontend static files to nginx web root
COPY index.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Copy custom nginx configuration for API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf