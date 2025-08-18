"use client";
import { apiGet } from "utils/apiUtils";

export const fetchGenders = async (setGenders, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, genders: true }));
    const data = await apiGet("/api/Gender");
    setGenders(data);

    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        gender: data.map((g) => g.label),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des genres:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des genres: ${error.message}`,
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, genders: false }));
  }
};
