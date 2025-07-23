"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchAllTransports = async (
  setTransports,
  setIsLoading,
  setTotalEntries,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, transports: true }));

    const response = await fetch(`${BASE_URL}/api/Transport`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des transports: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Response (All Transports):", data); // Debug: Log the API response
    // Ensure transports is always an array
    const transportsData = Array.isArray(data) ? data : [];
    setTransports(transportsData);
    setTotalEntries(transportsData.length || 0); // Use array length since no totalCount in GET all
  } catch (error) {
    console.error("Erreur lors du chargement des transports:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des transports: ${error.message}`,
    });
    setTransports([]); // Fallback to empty array on error
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

    const response = await fetch(`${BASE_URL}/api/Transport/${transportId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement du transport: ${response.statusText}`);
    }

    const data = await response.json();
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