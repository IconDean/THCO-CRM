#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 1. Frontend env if missing
if [ ! -f frontend/.env ] && [ -f frontend/.env.example ]; then
  cp frontend/.env.example frontend/.env
fi

# 2. Frontend dependencies if node_modules missing
if [ ! -d frontend/node_modules ]; then
  echo "Installing frontend dependencies..."
  cd frontend
  npm install
  cd ..
else
  echo "Frontend dependencies already installed."
fi

# 3. Start backend
echo "Starting backend on http://localhost:8000"
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
BACK_PID=$!
cd ..

# 4. Start frontend
echo "Starting frontend on http://localhost:5178"
cd frontend
npm run start &
FRONT_PID=$!
cd ..

echo ""
echo "Backend PID: $BACK_PID"
echo "Frontend PID: $FRONT_PID"
echo "Frontend: http://localhost:5178"
echo "Backend:  http://localhost:8000"
echo "Press Ctrl+C to stop both."

wait
