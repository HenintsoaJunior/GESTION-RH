import { apiGet, apiPost, apiPut,apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Récupérer userId depuis localStorage
const userData = JSON.parse(localStorage.getItem("user"));
const userId = userData?.userId;
// Fonction pour mettre à jour une mission
export const updateMission = async (
  missionId,
  missionData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, mission: true }));

    

    if (!userId) {
      throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
    }

    // Ajouter userId aux données de la mission
    const missionDataWithUser = {
      ...missionData,
      userId: userId.trim(),
    };

    const updatedMission = await apiPut(`/api/Mission/${missionId}`, missionDataWithUser);
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Mission "${updatedMission.name}" mise à jour avec succès !`,
    });
    return updatedMission;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la mission:", error);
    onError({
      isOpen: true,
      type: "error",
      message: error.message || "Erreur lors de la mise à jour de la mission.",
      fieldErrors: error.fieldErrors || {},
    });
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, mission: false }));
  }
};

export const deleteMissionAssignation = async (
  assignationId,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionAssignation: true }));
    await apiDelete(`/api/MissionAssignation/${assignationId}`);
    onSuccess({
      isOpen: true,
      type: "success",
      message: "Assignation supprimée avec succès !",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'assignation:", error);
    const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la suppression de l'assignation.";
    const fieldErrors = error.response?.data?.errors || {};
    onError({
      isOpen: true,
      type: "error",
      message: errorMessage,
      fieldErrors,
    });
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, missionAssignation: false }));
  }
};

export const updateMissionAssignation = async (
  assignationId,
  assignationData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionAssignation: true }));

    // Vérifie que assignationId et missionId sont fournis
    if (!assignationId) {
      throw new Error("Les identifiants de l'assignation et de la mission sont requis.");
    }

    const updatedAssignation = await apiPut(`/api/MissionAssignation/${assignationId}`, assignationData);
    
    onSuccess({
      isOpen: true,
      type: "success",
      message: "Assignation mise à jour avec succès !",
    });
    
    return updatedAssignation;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'assignation:", error);
    
    // Gestion des erreurs spécifiques de l'API
    const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la mise à jour de l'assignation.";
    const fieldErrors = error.response?.data?.errors || {};

    onError({
      isOpen: true,
      type: "error",
      message: errorMessage,
      fieldErrors,
    });
    
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, missionAssignation: false }));
  }
};


export const exportMissionAssignationPDF = async (
  filters,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, exportPDF: true }));

    // Call API to generate PDF
    const blob = await apiPost(
      '/api/MissionPaiement/generate-pdf',
      {
        missionId: filters.missionId || null,
        employeeId: filters.employeeId || null,
        transportId: filters.transportId || null,
        lieuId: filters.lieuId || null,
        departureDate: filters.departureDate || null,
        departureArrive: filters.departureArrive || null,
        status: filters.status || null,
      },
      {},
      {
        Accept: 'application/pdf',
      },
      'blob'
    );

    if (blob.size === 0) {
      throw new Error('Le fichier PDF généré est vide');
    }

    // Create download URL
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // File name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `Mission_Assignation_${timestamp}.pdf`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Success
    onSuccess({
      isOpen: true,
      type: 'success',
      message: `Fichier PDF "${filename}" exporté avec succès !`,
    });
  } catch (error) {
    // Error handling
    let userMessage = 'Erreur lors de l’exportation PDF';
    if (error.message.includes('404')) {
      userMessage = 'Service d’exportation non trouvé. Contactez l’administrateur.';
    } else if (error.message.includes('500')) {
      userMessage = 'Erreur interne du serveur. Réessayez plus tard.';
    } else if (error.message.includes('403') || error.message.includes('401')) {
      userMessage = 'Accès non autorisé. Vérifiez vos permissions.';
    } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      userMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
    } else if (error.message.includes('requis')) {
      userMessage = error.message;
    } else if (error.message.includes('JSON.parse')) {
      userMessage = 'Réponse du serveur invalide. Le fichier PDF n’a pas pu être généré.';
    }

    onError({
      isOpen: true,
      type: 'error',
      message: `${userMessage}: ${error.message}`,
      details: {
        ...filters,
        timestamp: new Date().toISOString(),
      },
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, exportPDF: false }));
  }
};

export const exportMissionAssignationExcel = async (
  filters,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, exportExcel: true }));

    // Appeler l'API avec les filtres
    const blob = await apiPost(
      '/api/MissionAssignation/generate-excel',
      {
        missionId: filters.missionId || null,
        employeeId: filters.employeeId || null,
        transportId: filters.transportId || null,
        lieuId: filters.lieuId || null,
        departureDate: filters.departureDate || null,
        departureArrive: filters.departureArrive || null,
        status: filters.status || null,
      },
      {},
      {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      'blob'
    );

    if (blob.size === 0) {
      throw new Error('Le fichier Excel généré est vide');
    }

    // Créer l'URL de téléchargement
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Nom du fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `Mission_Assignations_${timestamp}.xlsx`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Nettoyage
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Succès
    onSuccess({
      isOpen: true,
      type: 'success',
      message: `Fichier Excel "${filename}" exporté avec succès !`,
    });
  } catch (error) {
    // Gestion des erreurs
    let userMessage = 'Erreur lors de l’exportation Excel';
    if (error.message.includes('404')) {
      userMessage = 'Service d’exportation non trouvé. Contactez l’administrateur.';
    } else if (error.message.includes('500')) {
      userMessage = 'Erreur interne du serveur. Réessayez plus tard.';
    } else if (error.message.includes('403') || error.message.includes('401')) {
      userMessage = 'Accès non autorisé. Vérifiez vos permissions.';
    } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      userMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
    } else if (error.message.includes('requis')) {
      userMessage = error.message;
    } else if (error.message.includes('JSON.parse')) {
      userMessage = 'Réponse du serveur invalide. Le fichier Excel n’a pas pu être généré.';
    }

    onError({
      isOpen: true,
      type: 'error',
      message: `${userMessage}: ${error.message}`,
      details: {
        ...filters,
        timestamp: new Date().toISOString(),
      },
    });
  } finally {
    setIsLoading((prev) => ({ ...prev, exportExcel: false }));
  }
};

// Fonction pour récupérer les employés non assignés
export const fetchNotAssignedEmployees = async (
  missionId,
  setEmployees,
  setIsLoading,
  setSuggestions,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, employees: true }));

    // Validation : ne pas faire l'appel si missionId est vide
    if (!missionId || missionId.trim() === "") {
      console.warn("missionId est vide, aucun appel API effectué");
      setEmployees([]);
      setSuggestions((prev) => ({ ...prev, beneficiary: [] }));
      return;
    }

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
      duration: parseInt(assignationData.duration, 10) || null
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
    setIsLoading((prev) => ({ ...prev, mission: true }));

    // Récupérer userId depuis localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;

    if (!userId) {
      throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
    }

    // Ajouter userId aux données de la mission
    const missionDataWithUser = {
      ...missionData,
      userId: userId.trim(),
    };

    const newMission = await apiPost("/api/Mission", missionDataWithUser);

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
    onError(handleValidationError(error, "MESSGA"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, mission: false }));
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
    if (!data || !data.missionAssignation || !data.dailyPaiements) {
      console.warn("API returned empty or invalid data:", data);
      setMissionPayment({ dailyPaiements: [], assignmentDetails: null, totalAmount: 0 });
      return;
    }

    // Transformation des données pour assignmentDetails
    const assignmentDetails = data.missionAssignation
      ? {
          assignationId: data.missionAssignation.assignationId,
          beneficiary: `${data.missionAssignation.employee?.firstName || ""} ${data.missionAssignation.employee?.lastName || ""}`.trim() || "Non spécifié",
          matricule: data.missionAssignation.employee?.employeeCode || "Non spécifié",
          missionTitle: data.missionAssignation.mission?.name || "Non spécifié",
          function: data.missionAssignation.employee?.jobTitle || "Non spécifié",
          base: `${data.missionAssignation.employee?.site?.siteName || "Non spécifié"} (${data.missionAssignation.employee?.site?.code || "Non spécifié"})`,
          meansOfTransport: data.missionAssignation.transport?.type || "Non spécifié",
          direction: data.missionAssignation.employee?.direction?.directionName || "Non spécifié",
          departmentService:
            data.missionAssignation.employee?.service?.serviceName ||
            data.missionAssignation.employee?.department?.departmentName ||
            "Non spécifié",
          costCenter: data.missionAssignation.employee?.costCenter || "Non spécifié",
          departureDate: data.missionAssignation.departureDate,
          departureTime: data.missionAssignation.departureTime || "Non spécifié",
          returnDate: data.missionAssignation.returnDate || "Non spécifié",
          returnTime: data.missionAssignation.returnTime || "Non spécifié",
          missionDuration: data.missionAssignation.duration || "N/A",
          startDate: data.missionAssignation.mission.startDate || "Non spécifié",
          status: data.missionAssignation.mission?.status || "Non spécifié",
        }
      : null;

    // Mise à jour de l'état avec les données transformées
    setMissionPayment({
      dailyPaiements: data.dailyPaiements,
      assignmentDetails,
      totalAmount: data.totalAmount,
    });
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors du chargement des données de paiement:", error);
    onError({
      isOpen: true,
      type: "error",
      message: error.message || "Erreur inconnue lors du chargement des données de paiement",
    });
    setMissionPayment({ dailyPaiements: [], assignmentDetails: null, totalAmount: 0 });
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

    // Include matricule as an array in the requestBody
    const requestBody = {
      employeeId: filters.employeeId || "",
      missionId: filters.missionId || "",
      transportId: filters.transportId || "",
      lieuId: filters.lieuId || "",
      matricule: Array.isArray(filters.matricule) ? filters.matricule : filters.matricule ? [filters.matricule] : [],
      minDepartureDate: filters.startDate && !isNaN(new Date(filters.startDate).getTime())
        ? new Date(filters.startDate).toISOString()
        : null,
      maxDepartureDate: filters.endDate && !isNaN(new Date(filters.endDate).getTime())
        ? new Date(filters.endDate).toISOString()
        : null,
      status: filters.status || "",
    };

    console.log("Request Body:", requestBody);

    // Appel API pour récupérer les assignations
    const data = await apiPost(`/api/MissionAssignation/search?${queryParams}`, requestBody);
    console.log("API Response (Mission Assignations):", data);

    const assignMissionsData = Array.isArray(data.data)
      ? data.data.map((item) => ({
          assignationId: item.assignationId,
          employeeId: item.employeeId,
          missionId: item.missionId,
          transportId: item.transportId,
          departureDate: item.departureDate,
          returnDate: item.returnDate,
          departureTime: item.departureTime,
          returnTime: item.returnTime,
          duration: item.duration,
          beneficiary: `${item.employee?.firstName || ""} ${item.employee?.lastName || ""}`.trim() || "Non spécifié",
          matricule: item.employee?.employeeCode || "Non spécifié",
          missionTitle: item.mission?.name || "Non spécifié",
          startDate: item.mission?.startDate || "Non spécifié",
          endDate: item.mission?.endDate || "Non spécifié",
          lieu: item.mission?.lieu?.nom || "Non spécifié",
          function: item.employee?.jobTitle || "Non spécifié",
          base: item.employee?.site?.siteName || "Non spécifié",
          status: item.mission?.status || "Non spécifié",
          directionAcronym: item.employee?.direction?.acronym || "N/A",
          employee: item.employee,
          mission: item.mission,
          transport: item.transport,
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
  setTotalEntries = () => {}, // Valeur par défaut ajoutée
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

export const fetchMissions = async (
  setMissions,
  setIsLoading,
  setTotalEntries,
  filters = {},
  page = 1,
  pageSize = 10,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));

    const requestBody = {
      name: filters.name || "",
      startDate: filters.startDate || null,
      endDate: filters.endDate || null,
      lieuId: filters.lieuId || "",
      status: filters.status || "",
    };

    console.log("API SEND:", requestBody);

    const queryParams = new URLSearchParams({
      page,
      pageSize,
    }).toString();

    const data = await apiPost(`/api/Mission/search?${queryParams}`, requestBody);
    console.log("API Response:", data);

    const missionsData = Array.isArray(data.data) ? data.data : [];
    setMissions(missionsData);
    setTotalEntries(data.totalCount || missionsData.length || 0);
  } catch (error) {
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

// Fonction pour annuler une mission
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