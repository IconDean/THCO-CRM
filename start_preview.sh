#!/usr/bin/env bash
set -euo pipefail
# Build frontend and start backend (FastAPI) for preview environments
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Building frontend..."
cd "$ROOT_DIR/frontend"
if [ -f yarn.lock ]; then
  yarn install --silent
else
  npm install --silent
fi
yarn build --silent

echo "Starting backend..."
cd "$ROOT_DIR/backend"
# Bind to the port the platform assigns. Azure App Service and most PaaS hosts
# inject PORT (App Service also honours WEBSITES_PORT) and route external
# traffic only to that port -- a hardcoded 8000 makes the container start
# successfully but never receive traffic, so the deploy times out as unhealthy.
PORT="${PORT:-${WEBSITES_PORT:-8000}}"
echo "Binding to port $PORT"
exec uvicorn server:app --host 0.0.0.0 --port "$PORT"
