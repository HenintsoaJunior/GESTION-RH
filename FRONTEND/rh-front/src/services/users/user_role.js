"use client";

import { apiPost } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Service pour créer des relations utilisateur-rôle en masse
export const createUserRoleBulk = async (
  userRoleData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, userRoles: true }));

    // Préparation du corps de la requête
    const requestBody = {
      userId: userRoleData.userId,
      roleIds: userRoleData.roleIds
    };

    // Appel API pour créer les relations utilisateur-rôle en masse
    const response = await apiPost("/api/UserRole/bulk", requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Relations utilisateur-rôle mises à jour avec succès !`,
    });

    return response;
  } catch (error) {
    console.error("Erreur lors de la création en masse des relations utilisateur-rôle:", error);
    onError(handleValidationError(error, "Erreur lors de la mise à jour des relations utilisateur-rôle"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, userRoles: false }));
  }
};