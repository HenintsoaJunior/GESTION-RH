#!/bin/bash

echo "Arrêt du backend (dotnet run)..."
pkill -f "dotnet run"

echo "Arrêt du frontend (npm start)..."
pkill -f "npm start"

echo "Tous les services ont été arrêtés."
