"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchDepartments = async (setDepartments, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, departments: true }));
    const response = await fetch(`${BASE_URL}/api/Department`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des départements: ${response.statusText}`);
    }

    const data = await response.json();
    setDepartments(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        departement: data.map((dep) => dep.departmentName),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des départements:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des départements: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, departments: false }));
  }
};

export const getDepartmentId = (departmentName, departments) =>
  departments.find((dep) => dep.departmentName === departmentName)?.departmentId || "";