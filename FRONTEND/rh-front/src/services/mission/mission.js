"use client";

import { apiGet, apiPost,apiPut } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";



export const fetchNotAssignedEmployees = async (
  missionId,
  setEmployees,
  setIsLoading,
  setSuggestions,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, employees: true }));
    
    // Appel API pour récupérer les employés non assignés
    const data = await apiGet(`/api/MissionAssignation/not-assigned/${missionId}`);
    
    // S'assure que les données sont un tableau
    const employeesData = Array.isArray(data) ? data : [];
    
    // Mise à jour des suggestions pour l'autocomplétion
    setSuggestions((prev) => ({
      ...prev,
      beneficiary: employeesData.map((emp) => ({
        id: emp.employeeId,
        name: `${emp.lastName} ${emp.firstName}`,
        employeeCode: emp.employeeCode,
        jobTitle: emp.jobTitle,
        site: emp.site?.siteName,
        direction: emp.direction?.directionName,
        department: emp.department?.departmentName,
        service: emp.service?.serviceName,
        costCenter: emp.costCenter,
      })),
    }));
    
    setEmployees(employeesData);
  } catch (error) {
    console.error("Erreur lors du chargement des employés non assignés:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des employés non assignés: ${error.message}`,
    });
    setEmployees([]);
    setSuggestions((prev) => ({ ...prev, beneficiary: [] }));
  } finally {
    setIsLoading((prev) => ({ ...prev, employees: false }));
  }
};


// Fonction pour créer une assignation de mission
export const createMissionAssignation = async (
  assignationData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionAssignation: true })); // Indique le chargement

    // Préparation du corps de la requête
    const requestBody = {
      employeeId: assignationData.employeeId.trim(),
      missionId: assignationData.missionId.trim(),
      transportId: assignationData.transportId ? assignationData.transportId.trim() : null,
      departureDate: assignationData.departureDate ? new Date(assignationData.departureDate).toISOString() : null,
      departureTime: assignationData.departureTime || null,
      returnDate: assignationData.returnDate ? new Date(assignationData.returnDate).toISOString() : null,
      returnTime: assignationData.returnTime || null,
      duration: parseInt(assignationData.duration, 10) || null,
    };

    // Appel API pour créer l'assignation de mission
    const newAssignation = await apiPost("/api/MissionAssignation", requestBody);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Mission assignée avec succès à l'employé ${assignationData.employeeId}!`,
    });

    return newAssignation;
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de la création de l'assignation de mission:", error);
    onError(handleValidationError(error, "MESSGA"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, missionAssignation: false })); // Fin du chargement
  }
};


// Fonction pour créer une mission
export const createMission = async (
  missionData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, mission: true })); // Indique le chargement

    // Préparation du corps de la requête
    const requestBody = {
      missionId: missionData.missionId || "",
      name: missionData.name.trim(),
      description: missionData.description || "",
      startDate: new Date(missionData.startDate).toISOString() || null,
      lieuId: missionData.lieuId || "",
    };

    // Appel API pour créer la mission
    const newMission = await apiPost("/api/Mission", requestBody);
    
    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Mission "${newMission.name}" créée avec succès !`,
    });

    return newMission;
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de la création de la mission:", error);
    onError(handleValidationError(error,"MESSGA"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, mission: false })); // Fin du chargement
  }
};

// Fonction pour récupérer les paiements liés à une mission
export const fetchMissionPayment = async (
  missionId,
  employeeId,
  setMissionPayment,
  setIsLoading,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionPayment: true }));

    // Vérifie que les paramètres sont présents
    if (!missionId || !employeeId) {
      throw new Error("Mission ID et Employee ID sont requis");
    }

    console.log("Sending request with:", { missionId, employeeId });

    // Appel API pour récupérer les données de paiement
    const data = await apiPost("/api/MissionPaiement/generate", {
      missionId,
      employeeId,
    });

    console.log("API Response (Mission Payment):", data);

    // Vérifie la validité des données reçues
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("API returned empty or invalid data:", data);
      setMissionPayment({ indemnityDetails: [], assignmentDetails: null });
      return;
    }

    // Récupère l'ID du transport assigné
    const assignedTransportId = data[0]?.missionAssignation?.transportId;
    if (!assignedTransportId) {
      console.warn("Aucun transport assigné trouvé pour cette mission.");
    }

    // Transforme les données pour l'affichage
    const transformedData = data.map((item) => {
      const compensationScales = item.compensationScales || [];

      // Initialisation des montants par type de dépense
      const amounts = {
        lunch: 0,
        dinner: 0,
        breakfast: 0,
        accommodation: 0,
        transport: 0,
      };

      // Calcul des montants par catégorie
      compensationScales.forEach((scale) => {
        const amount = scale.amount || 0;
        if (scale.expenseType?.type === "Déjeuner") amounts.lunch += amount;
        else if (scale.expenseType?.type === "Diner") amounts.dinner += amount;
        else if (scale.expenseType?.type === "Petit Déjeuner") amounts.breakfast += amount;
        else if (scale.expenseType?.type === "Hébergement") amounts.accommodation += amount;
        else if (scale.transportId === assignedTransportId && scale.transportId !== null) amounts.transport += amount;
      });

      // Calcul du total
      const totalAmount = amounts.lunch + amounts.dinner + amounts.breakfast + amounts.accommodation + amounts.transport;

      return {
        date: item.date,
        transport: amounts.transport,
        breakfast: amounts.breakfast,
        lunch: amounts.lunch,
        dinner: amounts.dinner,
        accommodation: amounts.accommodation,
        total: totalAmount,
      };
    });

    // Vérifie la présence des infos d'assignation
    if (!data[0]?.missionAssignation) {
      console.warn("Aucune information de missionAssignation trouvée dans la réponse API.");
    }

    // Extraction des détails d'assignation
    const missionAssignation = data[0]?.missionAssignation || {};
    const employee = missionAssignation.employee || {};
    const mission = missionAssignation.mission || {};
    const transport = missionAssignation.transport || {};

    const assignmentDetails = {
      assignmentId: `${missionAssignation.employeeId || ""}-${missionAssignation.missionId || ""}-${missionAssignation.transportId || ""}`,
      employeeId: missionAssignation.employeeId || "",
      missionId: missionAssignation.missionId || "",
      transportId: missionAssignation.transportId || "",
      departureDate: missionAssignation.departureDate,
      departureTime: missionAssignation.departureTime,
      returnDate: missionAssignation.returnDate,
      returnTime: missionAssignation.returnTime,
      missionDuration: missionAssignation.duration,
      createdAt: missionAssignation.createdAt,
      beneficiary: `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Non spécifié",
      matricule: employee.employeeCode || "Non spécifié",
      missionTitle: mission.name || "Non spécifié",
      function: employee.jobTitle || "Non spécifié",
      base: `${employee.site.siteName} (${employee.site.code}) ` || "Non spécifié",
      status: mission.status || "Non spécifié",
      meansOfTransport: transport.type || "Non spécifié",
      direction: employee.direction?.directionName || "Non spécifié",
      departmentService: employee.service?.serviceName || employee.department?.departmentName || "Non spécifié",
      costCenter: employee.costCenter || "Non spécifié",
    };

    // Mise à jour de l'état avec les données transformées
    setMissionPayment({ indemnityDetails: transformedData, assignmentDetails });
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors du chargement des données de paiement:", error);
    onError({
      isOpen: true,
      type: "error",
      message: error.message || "Erreur inconnue lors du chargement des données de paiement",
    });
    setMissionPayment({ indemnityDetails: [], assignmentDetails: null });
  } finally {
    setIsLoading((prev) => ({ ...prev, missionPayment: false }));
  }
};

// Fonction pour récupérer les assignations de mission avec filtres et pagination
export const fetchAssignMission = async (
  setAssignMissions,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 10,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, assignMissions: true }));
    const queryParams = new URLSearchParams({
      page,
      pageSize,
    }).toString();
    // Préparation du corps de la requête avec gestion des dates
    const requestBody = {
      employeeId: filters.employeeId || "",
      missionId: filters.missionId || "",
      transportId: filters.transportId || "",
      departureDateMin: filters.departureDateMin && !isNaN(new Date(filters.departureDateMin).getTime())
        ? new Date(filters.departureDateMin).toISOString()
        : null,
      departureDateMax: filters.departureDateMax && !isNaN(new Date(filters.departureDateMax).getTime())
        ? new Date(filters.departureDateMax).toISOString()
        : null,
      status: filters.status || "",
    };
    console.log("Request Body:", requestBody);
    // Appel API pour récupérer les assignations
    const data = await apiPost(`/api/MissionAssignation/search?${queryParams}`, requestBody);
    console.log("API Response (Mission Assignations):", data);

    // Transformation des données pour l'UI
    const assignMissionsData = Array.isArray(data.data)
      ? data.data.map((item) => ({
          assignmentId: item.id || item.assignmentId || `${item.employeeId}-${item.missionId}-${item.transportId}`,
          employeeId: item.employeeId,
          missionId: item.missionId,
          transportId: item.transportId,
          departureDate: item.departureDate,
          beneficiary: `${item.employee?.firstName || ""} ${item.employee?.lastName || ""}`.trim() || "Non spécifié",
          matricule: item.employee?.employeeCode || "Non spécifié",
          missionTitle: item.mission?.name || "Non spécifié",
          function: item.employee?.jobTitle || "Non spécifié",
          base: item.employee?.site.siteName || "Non spécifié",
          status: item.mission?.status || "Non spécifié",
        }))
      : [];
    setAssignMissions(assignMissionsData);
    setTotalEntries(data.totalCount || assignMissionsData.length || 0);
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors du chargement des assignations de mission:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des assignations de mission: ${error.message}`,
    });
    setAssignMissions([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, assignMissions: false }));
  }
};

// Fonction pour récupérer toutes les missions
export const fetchAllMissions = async (
  setMissions,
  setIsLoading,
  setTotalEntries,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));
    const data = await apiGet("/api/Mission");
    console.log("API Response (All Missions):", data);

    // S'assure que missions est toujours un tableau
    const missionsData = Array.isArray(data) ? data : [];
    setMissions(missionsData);
    setTotalEntries(missionsData.length || 0);
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors du chargement des missions:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des missions: ${error.message}`,
    });
    setMissions([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, missions: false }));
  }
};

// Fonction pour récupérer les missions avec filtres et pagination
export const fetchMissions = async (
  setMissions,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 5,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));
    
    const requestBody = {
      name: filters.name || "",
      startDateMin: filters.startDateMin || null,
      startDateMax: filters.startDateMax || null,
      lieuId: filters.lieuId || "",
      status: filters.status || "",
    };
    
    console.log("API SEND:", requestBody);
    
    const queryParams = new URLSearchParams({
      page,
      pageSize,
    }).toString();
    
    // Appel API pour récupérer les missions filtrées
    const data = await apiPost(`/api/Mission/search?${queryParams}`, requestBody);
    console.log("API Response:", data);
    
    // S'assure que missions est toujours un tableau
    const missionsData = Array.isArray(data.data) ? data.data : [];
    setMissions(missionsData);
    setTotalEntries(data.totalCount || missionsData.length || 0);
    
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors du chargement des missions:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des missions: ${error.message}`,
    });
    setMissions([]);
  } finally {
    setIsLoading((prev) => ({ ...prev, missions: false }));
  }
};

// Fonction pour récupérer une mission par son ID
export const fetchMissionById = async (
  missionId,
  setMission,
  setIsLoading,
  onError
) => {
  try {
    if (typeof setIsLoading === "function") {
      setIsLoading(true);
    }
    // Appel API pour récupérer la mission
    const data = await apiGet(`/api/Mission/${missionId}`);
    setMission(data);
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors du chargement de la mission:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement de la mission: ${error.message}`,
    });
  } finally {
    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  }
};

// Fonction pour récupérer les statistiques des missions
export const fetchMissionStats = async (setStats, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, stats: true }));
    const data = await apiGet("/api/Mission/stats");
    setStats(data);
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors du chargement des statistiques:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des statistiques: ${error.message}`,
    });
    setStats({ total: 0, enCours: 0, terminee: 0, annulee: 0 });
  } finally {
    setIsLoading((prev) => ({ ...prev, stats: false }));
  }
};

export const cancelMission = async (
  missionId,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));
    
    // Appel API pour annuler la mission
    await apiPut(`/api/Mission/${missionId}/cancel`, null);

    // Affiche un message de succès
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Mission ${missionId} annulée avec succès.`,
    });
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de l'annulation de la mission:", error);
    onError({
      isOpen: true,
      type: "error",
      message: error.message || "Une erreur est survenue lors de l'annulation de la mission.",
    });
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, missions: false }));
  }
};

// Fonction utilitaire pour récupérer l'ID d'une mission à partir de son nom
export const getMissionId = (name, missions) =>
  missions.find((mission) => mission.name === name)?.missionId || "";