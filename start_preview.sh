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
exec uvicorn server:app --host 0.0.0.0 --port 8000
