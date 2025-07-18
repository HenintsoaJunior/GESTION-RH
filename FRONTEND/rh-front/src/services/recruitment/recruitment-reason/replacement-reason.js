"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchReplacementReasons = async (setReplacementReasons, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, replacementReasons: true }));
    const response = await fetch(`${BASE_URL}/api/ReplacementReason`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des raisons de remplacement: ${response.statusText}`);
    }

    const data = await response.json();
    setReplacementReasons(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        motifRemplacement: data.map((reason) => reason.name),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des raisons de remplacement:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des raisons de remplacement: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, replacementReasons: false }));
  }
};

export const getReplacementReasonId = (reasonName, replacementReasons) =>
  replacementReasons.find((reason) => reason.name === reasonName)?.replacementReasonId || "";