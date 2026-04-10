@echo off
echo Starting AI Bot Detection Environment...

start "Backend API" cmd /k "cd backend && uvicorn main:app --reload --port 8000"
start "Dashboard" cmd /k "cd dashboard && npm run dev -- --port 5173"
start "Target Site" cmd /k "cd target-site && npm run dev -- --port 3000"

echo All services starting! 
echo Dashboard: http://localhost:5173
echo Target Site: http://localhost:3000
echo Backend API: http://localhost:8000
