"use client";
import { apiGet } from "utils/apiUtils";

export const fetchWorkingTimeTypes = async (setWorkingTimeTypes, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, workingTimeTypes: true }));
    const data = await apiGet("/api/WorkingTimeType");
    setWorkingTimeTypes(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        workingTimeType: data.map((type) => type.label),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des types de temps de travail:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des types de temps de travail: ${error.message}`,
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, workingTimeTypes: false }));
  }
};
