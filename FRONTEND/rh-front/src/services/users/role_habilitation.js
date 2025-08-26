"use client";

import { apiPost } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Service pour créer des relations rôle-habilitation
export const createRoleHabilitation = async (
  roleHabilitationData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, roleHabilitations: true }));

    // Préparation du corps de la requête
    const requestBody = {
      roleIds: roleHabilitationData.roleIds,
      habilitationIds: roleHabilitationData.habilitationIds
    };

    // Appel API pour créer les relations rôle-habilitation
    const newRoleHabilitation = await apiPost("/api/role/role-habilitations", requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Relations rôle-habilitation créées avec succès !`,
    });

    return newRoleHabilitation;
  } catch (error) {
    console.error("Erreur lors de la création des relations rôle-habilitation:", error);
    onError(handleValidationError(error, "Erreur lors de la création des relations rôle-habilitation"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, roleHabilitations: false }));
  }
};