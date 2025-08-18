"use client";

import { apiGet } from "utils/apiUtils";

export const fetchContractTypes = async (setContractTypes, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, contractTypes: true }));
    const data = await apiGet("/api/ContractType");
    setContractTypes(data);
    
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        typeContrat: data.map((ct) => ct.code),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des types de contrat:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des types de contrat: ${error.message}`,
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, contractTypes: false }));
  }
};

export const getContractTypeId = (code, contractTypes) =>
  contractTypes.find((ct) => ct.code === code)?.contractTypeId || "";
