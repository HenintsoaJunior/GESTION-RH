#!/bin/bash

# Lancer le backend .NET
gnome-terminal -- bash -c "cd BACKEND/rh-backend/src/MyApp.Api && dotnet run; exec bash"

# Lancer le frontend (Node.js)
gnome-terminal -- bash -c "cd FRONTEND/rh-front && npm start; exec bash"

echo "Lancement du backend (.NET) et du frontend (npm)..."
