"use client";

import { apiGet, apiPost } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

export const createTransport = async (
  transportData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, transports: true })); // Indique le chargement

    // Préparation du corps de la requête
    const requestBody = {
      type: transportData.type.trim(),
    };

    // Appel API pour créer le transport
    const newTransport = await apiPost("/api/Transport", requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Transport "${transportData.type}" créé avec succès !`,
    });

    return newTransport;
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de la création du transport:", error);
    onError(handleValidationError(error, "Erreur lors de la création du transport"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, transports: false })); // Fin du chargement
  }
};

export const fetchAllTransports = async (
  setTransports,
  setIsLoading,
  setTotalEntries,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, transports: true }));

    // Use apiGet instead of direct fetch
    const data = await apiGet("/api/Transport");
    console.log("API Response (All Transports):", data);

    // Ensure transports is always an array
    const transportsData = Array.isArray(data) ? data : [];
    setTransports(transportsData);
    setTotalEntries(transportsData.length || 0);
  } catch (error) {
    console.error("Erreur lors du chargement des transports:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des transports: ${error.message}`,
    });
    setTransports([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, transports: false }));
  }
};

export const fetchTransportById = async (
  transportId,
  setTransport,
  setIsLoading,
  onError
) => {
  try {
    if (typeof setIsLoading === "function") {
      setIsLoading(true);
    }

    // Use apiGet instead of direct fetch
    const data = await apiGet(`/api/Transport/${transportId}`);
    setTransport(data);
  } catch (error) {
    console.error("Erreur lors du chargement du transport:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement du transport: ${error.message}`,
    });
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }
};

export const getTransportId = (type, transports) =>
  transports.find((transport) => transport.type === type)?.transportId || "";