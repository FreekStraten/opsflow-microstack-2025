## Stage 1: get envsubst binary
## Stage 1: get alertmanager binary from the official image
FROM prom/alertmanager:v0.27.0 AS am

## Stage 2: minimal OS with envsubst available
FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends gettext-base ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy the alertmanager binary from the official image
COPY --from=am /bin/alertmanager /bin/alertmanager

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
