"use client";

import { apiGet, apiPost, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Service pour créer une habilitation
export const createHabilitation = async (
  habilitationData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, habilitations: true }));

    // Préparation du corps de la requête
    const requestBody = {
      label: habilitationData.label.trim(),
      description: habilitationData.description?.trim() || "",
    };

    // Appel API pour créer l'habilitation
    const newHabilitation = await apiPost("/api/role/habilitations", requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Habilitation "${habilitationData.label}" créée avec succès !`,
    });

    return newHabilitation;
  } catch (error) {
    console.error("Erreur lors de la création de l'habilitation:", error);
    onError(handleValidationError(error, "Erreur lors de la création de l'habilitation"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, habilitations: false }));
  }
};

// Service pour récupérer toutes les habilitations
export const fetchAllHabilitations = async (
  setHabilitations,
  setIsLoading,
  setTotalEntries,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, habilitations: true }));

    // Utilisation de apiGet pour récupérer les habilitations
    const data = await apiGet("/api/role/habilitations");
    console.log("API Response (All Habilitations):", data);

    // S'assurer que habilitations est toujours un tableau
    const habilitationsData = Array.isArray(data) ? data : [];
    setHabilitations(habilitationsData);
    setTotalEntries(habilitationsData.length || 0);
  } catch (error) {
    console.error("Erreur lors du chargement des habilitations:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des habilitations: ${error.message}`,
    });
    setHabilitations([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, habilitations: false }));
  }
};

// Service pour récupérer une habilitation par ID
export const fetchHabilitationById = async (
  habilitationId,
  setHabilitation,
  setIsLoading,
  onError
) => {
  try {
    if (typeof setIsLoading === "function") {
      setIsLoading(true);
    }

    // Utilisation de apiGet pour récupérer une habilitation spécifique
    const data = await apiGet(`/api/role/habilitations/${habilitationId}`);
    setHabilitation(data);
  } catch (error) {
    console.error("Erreur lors du chargement de l'habilitation:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement de l'habilitation: ${error.message}`,
    });
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }
};

// Service pour mettre à jour une habilitation
export const updateHabilitation = async (
  habilitationId,
  habilitationData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, habilitations: true }));

    // Préparation du corps de la requête
    const requestBody = {
      habilitationId: habilitationId,
      label: habilitationData.label.trim(),
      description: habilitationData.description?.trim() || "",
    };

    // Appel API pour mettre à jour l'habilitation
    await apiPut(`/api/role/habilitations/${habilitationId}`, requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Habilitation "${habilitationData.label}" mise à jour avec succès !`,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'habilitation:", error);
    onError(handleValidationError(error, "Erreur lors de la mise à jour de l'habilitation"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, habilitations: false }));
  }
};

// Service pour supprimer une habilitation
export const deleteHabilitation = async (
  habilitationId,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, habilitations: true }));

    // Appel API pour supprimer l'habilitation
    await apiDelete(`/api/role/habilitations/${habilitationId}`);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Habilitation supprimée avec succès !`,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'habilitation:", error);
    onError(handleValidationError(error, "Erreur lors de la suppression de l'habilitation"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, habilitations: false }));
  }
};

// Service pour récupérer une habilitation par son label
export const getHabilitationId = (label, habilitations) =>
  habilitations.find((habilitation) => habilitation.label === label)?.habilitationId || "";