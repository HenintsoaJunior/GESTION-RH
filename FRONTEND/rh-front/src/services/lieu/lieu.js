"use client";

import { apiGet, apiPost } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Fetch all lieux
export const fetchAllRegions = async (setRegions, setIsLoading, setTotalEntries, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, lieux: true }));
    const data = await apiGet("/api/Lieu");
    console.log("API Response (All Lieux):", data);
    
    const lieuxData = Array.isArray(data) ? data : [];
    setRegions(lieuxData);
    setTotalEntries(lieuxData.length || 0);
  } catch (error) {
    console.error("Erreur lors du chargement des lieux:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des lieux: ${error.message}`,
    });
    setRegions([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, lieux: false }));
  }
};

// Create a new lieu
export const createRegion = async (regionData, setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, lieux: true }));

    // Préparation du corps de la requête
    const requestBody = {
      nom: regionData.nom?.trim() || "",
      adresse: regionData.adresse?.trim() || "",
      ville: regionData.ville?.trim() || "",
      codePostal: regionData.codePostal?.trim() || "",
      pays: regionData.pays?.trim() || "",
    };

    console.log("Sending request to create lieu:", requestBody);
    const newLieu = await apiPost("/api/Lieu", requestBody);
    console.log("API Response (New Lieu):", newLieu);

    onSuccess({
      isOpen: true,
      type: "success",
      message: `Lieu "${newLieu.nom}" créé avec succès !`,
    });

    return newLieu;
  } catch (error) {
    console.error("Erreur lors de la création du lieu:", error);
    onError(handleValidationError(error, "Erreur lors de la création du lieu"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, lieux: false }));
  }
};

// Search lieux with filters
export const searchRegions = async (
  setRegions,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 10,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, lieux: true }));
    const requestBody = {
      nom: filters.nom?.trim() || "",
      adresse: filters.adresse?.trim() || "",
      ville: filters.ville?.trim() || "",
      codePostal: filters.codePostal?.trim() || "",
      pays: filters.pays?.trim() || "",
    };
    console.log("Request Body for lieu search:", requestBody);
    const data = await apiPost("/api/Lieu/search", requestBody, { page, pageSize });
    console.log("API Response (Lieu Search):", data);

    const lieuxData = Array.isArray(data.data) ? data.data : [];
    setRegions(lieuxData);
    setTotalEntries(data.totalCount || lieuxData.length || 0);
  } catch (error) {
    console.error("Erreur lors de la recherche des lieux:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors de la recherche des lieux: ${error.message}`,
    });
    setRegions([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, lieux: false }));
  }
};

// Fetch a lieu by its ID
export const fetchRegionById = async (lieuId, setRegion, setIsLoading, onError) => {
  try {
    if (typeof setIsLoading === "function") {
      setIsLoading((prev) => ({ ...prev, lieu: true }));
    }

    if (!lieuId || typeof lieuId !== "string") {
      throw handleValidationError("Lieu ID est requis et doit être une chaîne.");
    }

    const data = await apiGet(`/api/Lieu/${lieuId}`);
    console.log("API Response (Lieu by ID):", data);
    setRegion(data);
  } catch (error) {
    console.error("Erreur lors du chargement du lieu:", error);
    onError(handleValidationError(error, "Erreur lors du chargement du lieu"));
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading((prev) => ({ ...prev, lieu: false }));
    }
  }
};

// Utility to get lieu ID from its name
export const getLieuId = (name, regions) =>
  regions.find((region) => region.nom === name)?.lieuId || "";