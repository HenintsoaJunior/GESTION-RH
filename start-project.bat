@echo off
echo Démarrage des services...

REM Lancer le backend .NET
start "" cmd /k "cd /d BACKEND\rh-backend\src\MyApp.Api && dotnet run"

REM Lancer le frontend (Node.js)
start "" cmd /k "cd /d FRONTEND\rh-front && npm start"

echo Backend (.NET) et Frontend (npm) lancés.
