"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchDirections = async (setDirections, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, directions: true }));
    const response = await fetch(`${BASE_URL}/api/Direction`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des directions: ${response.statusText}`);
    }

    const data = await response.json();
    setDirections(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        direction: data.map((dir) => dir.directionName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des directions:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des directions: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, directions: false }));
  }
};

export const getDirectionId = (directionName, directions) =>
  directions.find((dir) => dir.directionName === directionName)?.directionId || "";