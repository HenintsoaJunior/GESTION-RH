"use client";
import { apiGet } from "utils/apiUtils";

export const fetchUnits = async (setUnits, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, units: true }));
    const data = await apiGet("/api/Unit");
    setUnits(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        unit: data.map((unit) => unit.unitName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des unités:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des unités: ${error.message}`,
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, units: false }));
  }
};
