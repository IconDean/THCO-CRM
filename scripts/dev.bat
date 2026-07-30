@echo off
setlocal

cd /d "%~dp0.."

if not exist frontend\.env (
  if exist frontend\.env.example (
    copy frontend\.env.example frontend\.env
  )
)

if not exist frontend\node_modules (
  echo Installing frontend dependencies...
  pushd frontend
  npm install
  popd
) else (
  echo Frontend dependencies already installed.
)

echo Starting backend on http://localhost:8000
start "THCO Backend" cmd /c "cd backend && python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000"

echo Starting frontend on http://localhost:5178
start "THCO Frontend" cmd /c "cd frontend && npm run start"

echo.
echo Frontend: http://localhost:5178
echo Backend:  http://localhost:8000
