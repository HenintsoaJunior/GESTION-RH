"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchContractTypes = async (setContractTypes, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, contractTypes: true }));
    const response = await fetch(`${BASE_URL}/api/ContractType`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des types de contrat: ${response.statusText}`);
    }

    const data = await response.json();
    setContractTypes(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        typeContrat: data.map((ct) => ct.code),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des types de contrat:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des types de contrat: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, contractTypes: false }));
  }
};

export const getContractTypeId = (typeContrat, contractTypes) =>
  contractTypes.find((ct) => ct.code === typeContrat)?.contractTypeId || "";