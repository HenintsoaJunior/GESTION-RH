"use client";

import { apiGet } from "utils/apiUtils";

export const fetchEmployees = async (setEmployees, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, employees: true }));

    const data = await apiGet("/api/Employee");

    setEmployees(data);

    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        superieurHierarchique: [], // Initialiser à vide, le filtrage est géré dans RecruitmentRequestForm
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des employés:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des employés: ${error.message || "Erreur inconnue"}`,
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, employees: false }));
  }
};

export const getSupervisorId = (supervisorName, employees) =>
  employees.find((emp) => `${emp.lastName} ${emp.firstName}` === supervisorName)?.employeeId || "";
