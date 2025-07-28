"use client";
import { apiGet } from "utils/apiUtils";

export const fetchMaritalStatuses = async (setMaritalStatuses, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, maritalStatuses: true }));
    const data = await apiGet("/api/MaritalStatus");
    setMaritalStatuses(data);

    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        maritalStatus: data.map((status) => status.label),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des statuts matrimoniaux:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des statuts matrimoniaux: ${error.message}`,
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, maritalStatuses: false }));
  }
};
