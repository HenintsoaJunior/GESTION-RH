"use client";

import { BASE_URL } from "config/apiConfig";

// Fonction pour gérer la connexion d'un utilisateur
export const loginUser = async (username, password, setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, login: true }));

    const response = await fetch(`${BASE_URL}/api/Auth`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error("Échec de la connexion");
    }

    const data = await response.json();

    if (data.user?.userId && data.token) {
      // Stocker les données utilisateur dans localStorage
      const userData = {
        userId: data.user.userId,
        email: data.user.email,
        name: data.user.name,
        department: data.user.department,
        userType: data.user.userType,
        roles: data.user.roles || [],
      };
      localStorage.setItem("user", JSON.stringify(userData));

      // Stocker l'objet token complet dans localStorage
      localStorage.setItem("token", JSON.stringify({
        accessToken: data.token.accessToken,
        refreshToken: data.token.refreshToken,
        expiresIn: data.token.expiresIn,
      }));

      onSuccess({
        isOpen: true,
        type: data.type || "success",
        message: data.message || "Connexion réussie",
        user: userData,
        token: {
          accessToken: data.token.accessToken,
          refreshToken: data.token.refreshToken,
          expiresIn: data.token.expiresIn,
        },
      });
    } else {
      throw new Error("Réponse API invalide");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    onError({
      message: "Nom d'utilisateur ou mot de passe incorrect",
      type: "error",
      details: error.message || "Erreur inconnue",
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, login: false }));
  }
};

export const logoutUser = async (setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, logout: true }));

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    const response = await fetch(`${BASE_URL}/api/Auth/logout`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))?.accessToken || ""}`,
      },
    });

    if (!response.ok) {
      throw new Error("Échec de la déconnexion");
    }

    onSuccess({
      isOpen: true,
      type: "success",
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    onError({
      message: "Erreur lors de la déconnexion",
      type: "error",
      details: error.message || "Erreur inconnue",
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, logout: false }));
  }
};