"use client";

import { BASE_URL_LDAP } from "config/apiConfig";

// Fonction pour gérer la connexion d'un utilisateur
export const loginUser = async (email, password, setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, login: true }));

    const response = await fetch(`${BASE_URL_LDAP}/api/Login`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      throw new Error("Échec de la connexion");
    }

    const data = await response.json();

    if (data.user?.id && data.token) {
      // Stocker les données dans localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          matricule: data.user.matricule,
          email: data.user.email,
          name: data.user.name,
          department: data.user.department,
          poste: data.user.poste,
          superiorId: data.user.superiorId,
          superiorName: data.user.superiorName,
          typeUser: data.user.typeUser,
        })
      );
      localStorage.setItem("token", data.token); // Stocker le token séparément

      onSuccess({
        isOpen: true,
        type: data.type || "success",
        message: data.message || "Connexion réussie",
        user: {
          id: data.user.id,
          matricule: data.user.matricule,
          email: data.user.email,
          name: data.user.name,
          department: data.user.department,
          poste: data.user.poste,
          superiorId: data.user.superiorId,
          superiorName: data.user.superiorName,
          typeUser: data.user.typeUser,
          habilitations: data.user.habilitations || [],
        },
        token: data.token,
      });
    } else {
      throw new Error("Réponse API invalide");
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    onError({
      message: "Email ou mot de passe incorrect",
      type: "error",
      details: error.message || "Erreur inconnue",
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, login: false }));
  }
};