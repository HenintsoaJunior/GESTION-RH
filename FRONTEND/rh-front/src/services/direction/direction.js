"use client";
import { apiGet } from "utils/apiUtils";

export const fetchDirections = async (setDirections, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, directions: true }));
    const data = await apiGet("/api/Direction");
    setDirections(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        direction: data.map((dir) => dir.directionName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des directions:", error);
    onError({ 
      isOpen: true, 
      type: "error", 
      message: `Erreur lors du chargement des directions: ${error.message}` 
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, directions: false }));
  }
};

export const getDirectionId = (directionName, directions) =>
  directions.find((dir) => dir.directionName === directionName)?.directionId || "";