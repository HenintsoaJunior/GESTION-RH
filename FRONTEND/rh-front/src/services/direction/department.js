"use client";
import { apiGet } from "utils/apiUtils";

export const fetchDepartments = async (setDepartments, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, departments: true }));
    const data = await apiGet("/api/Department");
    setDepartments(data);
    
    // Ne pas mettre à jour les suggestions ici car elles seront filtrées par direction
    // dans le useEffect du composant principal
    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        departement: [], // Initialiser vide, sera mis à jour par le filtre
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des départements:", error);
    onError({ 
      isOpen: true, 
      type: "error", 
      message: `Erreur lors du chargement des départements: ${error.message}` 
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, departments: false }));
  }
};

export const getDepartmentId = (departmentName, departments) =>
  departments.find((dep) => dep.departmentName === departmentName)?.departmentId || "";