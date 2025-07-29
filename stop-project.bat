@echo off
echo Arrêt du backend (dotnet run)...
taskkill /F /IM dotnet.exe >nul 2>&1

echo Arrêt du frontend (npm start / node)...
taskkill /F /IM node.exe >nul 2>&1

echo Tous les services ont été arrêtés.
pause
