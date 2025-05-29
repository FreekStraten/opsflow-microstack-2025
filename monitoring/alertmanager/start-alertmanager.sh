#!/bin/sh
set -e

# Replace environment variables in the configuration file
envsubst < /etc/alertmanager/alertmanager.template.yml > /etc/alertmanager/alertmanager.yml

# Show the generated config for debugging (remove in production)
echo "Generated Alertmanager configuration:"
cat /etc/alertmanager/alertmanager.yml

# Start alertmanager with the generated config
exec /bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml --storage.path=/alertmanager