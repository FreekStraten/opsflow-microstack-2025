FROM prom/alertmanager:latest

# Install gettext for envsubst command
USER root
RUN apk add --no-cache gettext

# Copy configuration files
COPY alertmanager.template.yml /etc/alertmanager/alertmanager.template.yml
COPY start-alertmanager.sh /start-alertmanager.sh

# Make script executable and fix line endings
RUN chmod +x /start-alertmanager.sh && \
    sed -i 's/\r$//' /start-alertmanager.sh

# Switch back to alertmanager user
USER alertmanager

# Use our custom script as entrypoint
ENTRYPOINT ["/start-alertmanager.sh"]