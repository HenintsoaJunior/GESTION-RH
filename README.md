````markdown
# 🚀 Guide de Lancement du Projet GESTION-RH

Ce document détaillé présente toutes les étapes nécessaires pour démarrer l'application **GESTION-RH** (Backend, Frontend, et Base de Données) dans un environnement de développement local.

---

## 🛠️ Prérequis Techniques

Assurez-vous que les environnements suivants sont installés et configurés sur votre machine :

* **Runtime Backend :** **.NET 8+** (SDK)
* **Base de Données :** **SQL Server**
* **Runtime Frontend :** **Node.js 19+**
* **Git**
* **Gestionnaire de Paquets Frontend :** **npm** (inclus avec Node.js)

---

## ⚙️ Étape 1 : Configuration des Connexions

Avant tout démarrage, vous devez configurer les chemins d'accès à la base de données et à l'API.

### 1.1 Configuration de la Base de Données

Modifiez le fichier de configuration du **Backend** pour établir la connexion à votre instance SQL Server :

* **Fichier :** `BACKEND/rh-backend/src/MyApp.Api/appsettings.json`

Remplacez les placeholders dans la section `"ConnectionStrings"` par vos identifiants réels :

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=votre server ;Database=votre database ;User ID=votre userId ;Password=votre password;TrustServerCertificate=True;"
}
````

### 1.2 Configuration de l'API (Frontend)

Vérifiez que le **Frontend** pointe vers l'adresse et le port corrects du Backend. Le Frontend doit cibler le port **5432**.

  * **Fichier :** `FRONTEND/rh-front/src/config/apiConfig.js`

-----

## 🗃️ Étape 2 : Initialisation de la Base de Données (SQL Server)

La base de données doit être initialisée et peuplée avant le lancement de l'API.

1.  **Démarrage de SQL Server :** Assurez-vous que votre instance **SQL Server** est en cours d'exécution.
2.  **Exécution des Scripts :** Connectez-vous à la base de données configurée (voir 1.1) et exécutez les scripts SQL **dans l'ordre strict suivant** :

* **Fichier :** `TODO/BDD`

      * `index.sql` (Création des tables et index)
      * `sequence.sql` (Création des séquences, si nécessaire)
      * `data.sql` (Insertion des données initiales / de test)

-----

## 💻 Étape 3 : Lancement du Backend (.NET 8+)

Le serveur d'API écoute sur le **Port 5432**.

1.  **Navigation :** Ouvrez votre terminal et déplacez-vous vers le répertoire du projet Backend :
    ```bash
    cd BACKEND/rh-backend/src/MyApp.Api
    ```
2.  **Lancement :** Choisissez l'option de démarrage :
      * **Par défaut (localhost:port) :**
        ```bash
        dotnet run
        ```
      * **Avec IP Spécifique (pour un accès réseau externe ou conteneurisation) :**
        ```bash
        dotnet run --urls "http://0.0.0.0:5432"
        ```
    *(Le Backend devrait démarrer et afficher l'URL d'écoute.)*

-----

## 🖥️ Étape 4 : Lancement du Frontend (Node 19+)

Le client web écoute sur le **Port 3000**.

1.  **Navigation :** Ouvrez un **nouveau** terminal et déplacez-vous vers le répertoire du projet Frontend :
    ```bash
    cd FRONTEND/rh-front
    ```
2.  **Installation des Dépendances (Première fois uniquement) :** Installez toutes les dépendances :
    ```bash
    npm install
    ```
3.  **Démarrage :** Démarrez l'application Frontend en mode développement :
    ```bash
    npm start
    ```
    *(Le Frontend se compilera et devrait ouvrir l'application dans votre navigateur sur `http://localhost:3000`.)*

-----

## Structure du projet

# GESTION-RH

- **FRONTEND**
  - rh-front
    - src
- **BACKEND**
  - rh-backend
    - src
      - MyApp.Api
- **TODO**
  - BDD
- **README.md**



## ✅ Récapitulatif des Ports

| Composant | Technologie | Port |
| :--- | :--- | :--- |
| **Backend** | .NET 8 (API) | **5432** |
| **Frontend** | Node/React | **3000** |

```
```