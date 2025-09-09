"use client";

import { apiGet, apiPost, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Service pour créer un rôle
export const createRole = async (
  userId,
  roleData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, roles: true }));

    // Préparation du corps de la requête avec HabilitationIds
    const requestBody = {
      name: roleData.name.trim(),
      description: roleData.description?.trim() || "",
      userId,
      habilitationIds: roleData.habilitationIds || [], // Support des habilitations
    };

    // Appel API pour créer le rôle
    const newRole = await apiPost("/api/Role", requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Rôle "${roleData.name}" créé avec succès !`,
    });

    return newRole;
  } catch (error) {
    console.error("Erreur lors de la création du rôle:", error);
    onError(handleValidationError(error, "Erreur lors de la création du rôle"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, roles: false }));
  }
};

// Service pour récupérer tous les rôles
export const fetchAllRoles = async (
  setRoles,
  setIsLoading,
  setTotalEntries,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, roles: true }));

    // Utilisation de apiGet pour récupérer les rôles
    const data = await apiGet("/api/Role");
    console.log("API Response (All Roles):", data);

    // S'assurer que roles est toujours un tableau
    const rolesData = Array.isArray(data) ? data : [];
    setRoles(rolesData);
    setTotalEntries(rolesData.length || 0);
  } catch (error) {
    console.error("Erreur lors du chargement des rôles:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des rôles: ${error.message}`,
    });
    setRoles([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, roles: false }));
  }
};

// Service pour récupérer un rôle par ID
export const fetchRoleById = async (
  roleId,
  setRole,
  setIsLoading,
  onError
) => {
  try {
    if (typeof setIsLoading === "function") {
      setIsLoading(true);
    }

    // Utilisation de apiGet pour récupérer un rôle spécifique
    const data = await apiGet(`/api/Role/${roleId}`);
    setRole(data);
  } catch (error) {
    console.error("Erreur lors du chargement du rôle:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement du rôle: ${error.message}`,
    });
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }
};

// Service pour mettre à jour un rôle
export const updateRole = async (
  userId,
  roleData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, roles: true }));

    // Préparation du corps de la requête avec HabilitationIds
    const requestBody = {
      name: roleData.name.trim(),
      description: roleData.description?.trim() || "",
      userId,
      habilitationIds: roleData.habilitationIds || [], // Support des habilitations
    };

    // Appel API pour mettre à jour le rôle
    await apiPut(`/api/Role/${roleData.roleId}`, requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Rôle "${roleData.name}" mis à jour avec succès !`,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    onError(handleValidationError(error, "Erreur lors de la mise à jour du rôle"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, roles: false }));
  }
};

// Service pour supprimer un rôle
export const deleteRole = async (
  roleId,
  userId,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, roles: true }));

    // Appel API pour supprimer le rôle avec userId (selon votre controller)
    await apiDelete(`/api/Role/${roleId}/${userId}`);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Rôle supprimé avec succès !`,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle:", error);
    onError(handleValidationError(error, "Erreur lors de la suppression du rôle"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, roles: false }));
  }
};

// Service pour récupérer un rôle par son nom
export const getRoleId = (name, roles) =>
  roles.find((role) => role.name === name)?.roleId || "";

// Nouveau service pour créer un rôle avec des habilitations spécifiques
export const createRoleWithHabilitations = async (
  userId,
  roleData,
  selectedHabilitations,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, roles: true }));

    // Création du rôle avec les habilitations sélectionnées
    const roleDataWithHabilitations = {
      ...roleData,
      habilitationIds: selectedHabilitations.map(h => h.habilitationId || h.id),
    };

    const newRole = await createRole(
      userId,
      roleDataWithHabilitations,
      setIsLoading,
      onSuccess,
      onError
    );

    return newRole;
  } catch (error) {
    console.error("Erreur lors de la création du rôle avec habilitations:", error);
    throw error;
  }
};

// Service pour mettre à jour un rôle avec des habilitations spécifiques
export const updateRoleWithHabilitations = async (
  userId,
  roleData,
  selectedHabilitations,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, roles: true }));

    // Mise à jour du rôle avec les habilitations sélectionnées
    const roleDataWithHabilitations = {
      ...roleData,
      habilitationIds: selectedHabilitations.map(h => h.habilitationId || h.id),
    };

    await updateRole(
      userId,
      roleDataWithHabilitations,
      setIsLoading,
      onSuccess,
      onError
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle avec habilitations:", error);
    throw error;
  }
};