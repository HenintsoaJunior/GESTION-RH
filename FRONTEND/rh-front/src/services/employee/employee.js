"use client";

import { apiGet, apiPost, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";
export const fetchEmployees = async (missionId, onSuccess, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, employees: true }));

    const response = await apiGet("/api/Employee");
    const employees = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);

    onSuccess(employees);

    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        beneficiary: employees.map((emp) => ({
          id: emp.employeeId,
          name: `${emp.lastName} ${emp.firstName}`,
          displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
          employeeCode: emp.employeeCode,
          jobTitle: emp.jobTitle,
          site: emp.site?.siteName,
          direction: emp.direction?.directionName,
          department: emp.department?.departmentName,
          service: emp.service?.serviceName,
          costCenter: emp.costCenter,
          acronym: emp.direction?.acronym || "N/A",
        })),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des employés:", error);
    onError({
      message: "Erreur lors du chargement des employés",
      type: "error",
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, employees: false }));
  }
};


export const fetchAllEmployees = async (onSuccess, setIsLoading, setSuggestions, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, employees: true }));

    const response = await apiGet("/api/Employee");
    const employees = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);

    console.log("Employees fetched:", employees);
    console.log("Suggestions to be set:", employees.map((emp) => ({
      id: emp.employeeId,
      name: `${emp.lastName} ${emp.firstName}`,
      displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
    })));

    onSuccess(employees);

    if (setSuggestions) {
      setSuggestions((prev) => ({
        ...prev,
        beneficiary: employees.map((emp) => ({
          id: emp.employeeId,
          name: `${emp.lastName} ${emp.firstName}`,
          displayName: `${emp.lastName} ${emp.firstName} (${emp.direction?.acronym || "N/A"})`,
          employeeCode: emp.employeeCode,
          jobTitle: emp.jobTitle,
          site: emp.site?.siteName,
          direction: emp.direction?.directionName,
          department: emp.department?.departmentName,
          service: emp.service?.serviceName,
          costCenter: emp.costCenter,
          acronym: emp.direction?.acronym || "N/A",
        })),
      }));
    }
  } catch (error) {
    console.error("Erreur lors du chargement des employés:", error);
    onError({
      message: "Erreur lors du chargement des employés",
      type: "error",
    });
  } finally {
    console.log("isLoading.employees set to false");
    setIsLoading((prev) => ({ ...prev, employees: false }));
  }
};

export const fetchEmployeeById = async (id, setEmployee, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, employee: true }));

    const data = await apiGet(`/api/Employee/${id}`);

    setEmployee(data);
  } catch (error) {
    console.error(`Erreur lors du chargement de l'employé ${id}:`, error);
    onError({
      message: "Erreur lors du chargement de l'employé",
      type: "error"
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, employee: false }));
  }
};

// Fonction pour rechercher les employés avec filtres et pagination - CORRIGÉE
export const searchEmployees = async (
  filters, 
  page, 
  pageSize, 
  setEmployees, 
  setTotalCount, 
  setIsLoading, 
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, employees: true }));

    // Nettoyer les filtres - garder seulement les valeurs non vides/non null
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== "" && value !== null && value !== undefined) {
        cleanFilters[key] = value;
      }
    });

    console.log('Clean filters being sent:', cleanFilters);

    // Structure de la requête similaire à celle des missions
    const requestBody = {
      jobTitle: cleanFilters.jobTitle || "",
      lastName: cleanFilters.lastName || "",
      firstName: cleanFilters.firstName || "",
      directionId: cleanFilters.directionId || "",
      contractTypeId: cleanFilters.contractTypeId || "",
      employeeCode: cleanFilters.employeeCode || "",
      siteId: cleanFilters.siteId || "",
      status: cleanFilters.status || "",
      genderId: cleanFilters.genderId || "",
      departureDateMin: cleanFilters.departureDateMin || null,
      departureDateMax: cleanFilters.departureDateMax || null,
    };

    console.log('Request Body:', requestBody);

    // Pagination dans l'URL comme pour les missions
    const queryParams = new URLSearchParams({
      page: page || 1,
      pageSize: pageSize || 10,
    }).toString();

    // Appel API avec la même structure que les missions
    const data = await apiPost(`/api/Employee/search?${queryParams}`, requestBody);

    console.log('API Response:', data);

    // Support pour différents formats de réponse
    const employeesData = Array.isArray(data.data) ? data.data : 
                         Array.isArray(data.items) ? data.items : 
                         Array.isArray(data) ? data : [];
    
    setEmployees(employeesData);
    setTotalCount(data.totalCount || data.total || employeesData.length || 0);
  } catch (error) {
    console.error("Erreur lors de la recherche des employés:", error);
    onError({
      message: "Erreur lors de la recherche des employés",
      type: "error",
      details: error.message || "Erreur inconnue"
    });
    setEmployees([]);
    setTotalCount(0);
  } finally {
    setIsLoading((prev) => ({ ...prev, employees: false }));
  }
};

export const createEmployee = async (employeeData, setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, createEmployee: true }));
    console.log("Payload sent to /api/Employee:", JSON.stringify(employeeData, null, 2));
    const data = await apiPost("/api/Employee", employeeData);
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Employé créé avec succès avec l'ID: ${data.id}`,
    });
    return data;
  } catch (error) {
    console.error("Erreur lors de la création de l'employé:", error);
    console.log("Server response error:", error.response?.data);
    onError(handleValidationError(error, "Erreur lors de la création de l'employé"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, createEmployee: false }));
  }
};

export const updateEmployee = async (id, employeeData, setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, updateEmployee: true }));

    await apiPut(`/api/Employee/${id}`, employeeData);

    onSuccess({
      isOpen: true,
      type: "success",
      message: `Employé avec l'ID ${id} mis à jour avec succès`,
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'employé ${id}:`, error);
    onError(handleValidationError(error, "Erreur lors de la mise à jour de l'employé"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, updateEmployee: false }));
  }
};

export const deleteEmployee = async (id, setIsLoading, onSuccess, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, deleteEmployee: true }));

    await apiDelete(`/api/Employee/${id}`);

    onSuccess({
      isOpen: true,
      type: "success",
      message: `Employé avec l'ID ${id} supprimé avec succès`,
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
    onError(handleValidationError(error, "Erreur lors de la suppression de l'employé"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, deleteEmployee: false }));
  }
};

export const fetchEmployeeStats = async (setStats, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, stats: true }));

    const data = await apiGet("/api/Employee/stats");

    setStats(data);
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques des employés:", error);
    onError({
      message: "Erreur lors du chargement des statistiques des employés",
      type: "error"
    });
    setStats({ total: 0, actif: 0, inactif: 0, departed: 0 });
  } finally {
    setIsLoading((prev) => ({ ...prev, stats: false }));
  }
};

export const getSupervisorId = (supervisorName, employees) =>
  employees.find((emp) => `${emp.lastName} ${emp.firstName}` === supervisorName)?.employeeId || "";