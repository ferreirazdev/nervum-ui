#!/bin/sh
# Replace the VITE_API_BASE_URL placeholder baked at build time with
# the actual value from the Cloud Run environment variable at startup.
set -e

PLACEHOLDER="__VITE_API_BASE_URL_PLACEHOLDER__"
ACTUAL="${VITE_API_BASE_URL:-}"

if [ -n "$ACTUAL" ]; then
  echo "Injecting VITE_API_BASE_URL=$ACTUAL into static files..."
  find /usr/share/nginx/html -name "*.js" -exec sed -i "s|${PLACEHOLDER}|${ACTUAL}|g" {} +
fi

exec nginx -g "daemon off;"
