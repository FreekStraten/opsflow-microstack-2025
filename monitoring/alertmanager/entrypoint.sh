#!/bin/sh
set -eu

TMPL="/etc/alertmanager/alertmanager.yml.tmpl"
OUT="/tmp/alertmanager.yml"

if [ -f "$TMPL" ]; then
  echo "Templating $TMPL -> $OUT"
  if command -v envsubst >/dev/null 2>&1; then
    envsubst < "$TMPL" > "$OUT"
  elif [ -x /usr/local/bin/envsubst ]; then
    /usr/local/bin/envsubst < "$TMPL" > "$OUT"
  else
    echo "envsubst not found; cannot template config" >&2
    exit 1
  fi
else
  echo "Template $TMPL not found; exiting" >&2
  exit 1
fi

exec /bin/alertmanager \
  --config.file="$OUT" \
  --log.level=info
