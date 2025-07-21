"use client";

import { BASE_URL } from "config/apiConfig";

export const fetchEmployees = async (setEmployees, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, employees: true }));
    const response = await fetch(`${BASE_URL}/api/Employee`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors du chargement des employés: ${response.statusText}`);
    }

    const data = await response.json();
    setEmployees(data);
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        superieurHierarchique: [], // Initialiser à vide, le filtrage est géré dans RecruitmentRequestForm
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des employés:", error);
    onError({ isOpen: true, type: "error", message: `Erreur lors du chargement des employés: ${error.message}` });
  } finally {
    setIsLoading((prev) => ({ ...prev, employees: false }));
  }
};

export const getSupervisorId = (supervisorName, employees) =>
  employees.find((emp) => `${emp.lastName} ${emp.firstName}` === supervisorName)?.employeeId || "";