@echo off

REM Lancer le backend .NET
start cmd /k "cd backend && dotnet run"

REM Lancer le frontend (Node.js)
start cmd /k "cd frontend && npm start"

echo Lancement du backend (.NET) et du frontend (npm)...
