#!/bin/bash
set -e

# Replace environment variables in the configuration file
envsubst < /etc/alertmanager/alertmanager.template.yml > /etc/alertmanager/alertmanager.yml

# Start alertmanager with the generated config
exec /bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml