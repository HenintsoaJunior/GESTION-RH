import { apiGet, apiPost, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Récupérer userId depuis localStorage
const userData = JSON.parse(localStorage.getItem("user"));
const userId = userData?.userId;

// ----------------------------------------------------------------------
// SERVICES CRUD POUR MISSION ASSIGNATION (MissionAssignation)
// ----------------------------------------------------------------------

/**
 * Fonction pour créer une nouvelle assignation de mission.
 * @param {object} assignationData - Les données de la nouvelle assignation (IDs et champs simples).
 * @param {function} setIsLoading - Fonction pour gérer l'état de chargement.
 * @param {function} onSuccess - Fonction de rappel en cas de succès.
 * @param {function} onError - Fonction de rappel en cas d'erreur.
 * @returns {Promise<object>} La nouvelle assignation de mission créée.
 */
export const createMissionAssignation = async (
  assignationData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionAssignation: true }));

    if (!userId) {
      throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
    }

    // Préparation des données: L'API s'attend à des IDs simples pour la création.
    const payload = {
      // Les clés assignationId, employee, mission, transport, etc. sont omises
      employeeId: assignationData.employeeId,
      missionId: assignationData.missionId,
      transportId: assignationData.transportId, // Peut être null
      departureDate: assignationData.departureDate,
      departureTime: assignationData.departureTime,
      returnDate: assignationData.returnDate,
      returnTime: assignationData.returnTime,
      duration: assignationData.duration,
      isValidated: assignationData.isValidated, // Peut être null
      allocatedFund: assignationData.allocatedFund || 0,
      type: assignationData.type || "Indemnité",
      userId: userId.trim(), // Utilisateur effectuant la création
    };

    const newAssignation = await apiPost("/api/MissionAssignation", payload);

    onSuccess({
      isOpen: true,
      type: "success",
      message: `Assignation de mission "${newAssignation.assignationId}" créée avec succès !`,
    });

    return newAssignation;
  } catch (error) {
    console.error("Erreur lors de la création de l'assignation de mission:", error);
    onError(handleValidationError(error, "Erreur lors de la création de l'assignation."));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, missionAssignation: false }));
  }
};

/**
 * Fonction pour récupérer une assignation de mission par son ID.
 * @param {string} assignationId - L'ID de l'assignation à récupérer.
 * @param {function} setAssignation - Fonction pour mettre à jour l'état de l'assignation.
 * @param {function} setIsLoading - Fonction pour gérer l'état de chargement.
 * @param {function} onError - Fonction de rappel en cas d'erreur.
 */
export const fetchMissionAssignationById = async (
  assignationId,
  setAssignation,
  setIsLoading,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionAssignation: true }));

    if (!assignationId) {
      throw new Error("L'ID d'assignation est requis pour la récupération.");
    }

    const data = await apiGet(`/api/MissionAssignation/${assignationId}`);
    setAssignation(data);

  } catch (error) {
    console.error("Erreur lors du chargement de l'assignation de mission:", error);
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement de l'assignation ${assignationId}: ${error.message}`,
    });
    setAssignation(null);
  } finally {
    setIsLoading((prev) => ({ ...prev, missionAssignation: false }));
  }
};


/**
 * Fonction pour mettre à jour une assignation de mission existante.
 * @param {string} assignationId - L'ID de l'assignation à mettre à jour.
 * @param {object} assignationData - Les données de l'assignation à mettre à jour.
 * @param {function} setIsLoading - Fonction pour gérer l'état de chargement.
 * @param {function} onSuccess - Fonction de rappel en cas de succès.
 * @param {function} onError - Fonction de rappel en cas d'erreur.
 * @returns {Promise<object>} L'assignation de mission mise à jour.
 */
export const updateMissionAssignation = async (
  assignationId,
  assignationData,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionAssignation: true }));

    if (!userId) {
      throw new Error("Utilisateur non authentifié. Veuillez vous connecter.");
    }

    // Préparation des données pour la mise à jour
    const payload = {
      ...assignationData,
      assignationId: assignationId,
      employeeId: assignationData.employeeId,
      missionId: assignationData.missionId,
      transportId: assignationData.transportId,
      departureDate: assignationData.departureDate,
      departureTime: assignationData.departureTime,
      returnDate: assignationData.returnDate,
      returnTime: assignationData.returnTime,
      duration: assignationData.duration,
      isValidated: assignationData.isValidated,
      allocatedFund: assignationData.allocatedFund || 0,
      type: assignationData.type || "Indemnité",
      userId: userId.trim(), // Utilisateur effectuant la mise à jour
    };

    const updatedAssignation = await apiPut(`/api/MissionAssignation/${assignationId}`, payload);
    
    onSuccess({
      isOpen: true,
      type: "success",
      message: `Assignation "${updatedAssignation.assignationId}" mise à jour avec succès !`,
    });
    
    return updatedAssignation;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'assignation de mission:", error);
    onError(handleValidationError(error, "Erreur lors de la mise à jour de l'assignation."));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, missionAssignation: false }));
  }
};

/**
 * Supprime une assignation de mission spécifique.
 * (Fonction existante - conservée)
 * @param {string} assignationId - L'ID de l'assignation à supprimer.
 */
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


// ----------------------------------------------------------------------
// SERVICES DE RECHERCHE ET D'EXPORT (MissionAssignation/Mission)
// ----------------------------------------------------------------------

/**
 * Récupère les assignations de mission avec filtres et pagination.
 * (Fonction existante - conservée)
 */
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
    const requestBody = {
      employeeId: filters.employeeId || "",
      missionId: filters.missionId || "",
      missionType: filters.missionType || "",
      transportId: filters.transportId || "",
      lieuId: filters.lieuId || "",
      matricule: Array.isArray(filters.matricule) ? filters.matricule : filters.matricule ? [filters.matricule] : [],
      minDepartureDate: filters.minDepartureDate && !isNaN(new Date(filters.minDepartureDate).getTime())
        ? new Date(filters.minDepartureDate).toISOString()
        : null,
      maxDepartureDate: filters.maxDepartureDate && !isNaN(new Date(filters.maxDepartureDate).getTime())
        ? new Date(filters.maxDepartureDate).toISOString()
        : null,
      minArrivalDate: filters.minArrivalDate && !isNaN(new Date(filters.minArrivalDate).getTime())
        ? new Date(filters.minArrivalDate).toISOString()
        : null,
      maxArrivalDate: filters.maxArrivalDate && !isNaN(new Date(filters.maxArrivalDate).getTime())
        ? new Date(filters.maxArrivalDate).toISOString()
        : null,
      status: filters.status || "",
    };
    console.log("Request Body:", requestBody);
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
          MissionType: item.mission?.missionType || "Non spécifié",
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

/**
 * Exporte les assignations de mission au format PDF.
 * (Fonction existante - conservée)
 */
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

/**
 * Exporte les assignations de mission au format Excel.
 * (Fonction existante - conservée)
 */
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


// ----------------------------------------------------------------------
// SERVICES DE PAIEMENT DE MISSION (MissionPaiement)
// ----------------------------------------------------------------------

/**
 * Fonction pour récupérer les paiements liés à une mission.
 * (Fonction existante - conservée)
 */
export const fetchMissionPayment = async (
  missionId,
  employeeId,
  setMissionPayment,
  setIsLoading,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missionPayment: true }));

    if (!missionId || !employeeId) {
      throw new Error("Mission ID et Employee ID sont requis");
    }

    console.log("Sending request with:", { missionId, employeeId });

    const data = await apiPost("/api/MissionPaiement/generate", {
      missionId,
      employeeId,
    });

    console.log("API Response (Mission Payment):", data);

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


// ----------------------------------------------------------------------
// SERVICES CRUD POUR MISSION (Mission)
// ----------------------------------------------------------------------

/**
 * Fonction pour créer une mission.
 * (Fonction existante - conservée)
 */
export const createMission = async (
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

    const newMission = await apiPost("/api/Mission", missionDataWithUser);

    onSuccess({
      isOpen: true,
      type: "success",
      message: `Mission "${newMission.name}" créée avec succès !`,
    });

    return newMission;
  } catch (error) {
    console.error("Erreur lors de la création de la mission:", error);
    onError(handleValidationError(error, "MESSGA"));
    throw error;
  } finally {
    setIsLoading((prev) => ({ ...prev, mission: false }));
  }
};

/**
 * Fonction pour mettre à jour une mission.
 * (Fonction existante - conservée)
 */
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

/**
 * Fonction pour récupérer toutes les missions.
 * (Fonction existante - conservée)
 */
export const fetchAllMissions = async (
  setMissions,
  setIsLoading,
  setTotalEntries = () => {},
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));
    const data = await apiGet("/api/Mission");
    console.log("API Response (All Missions):", data);

    const missionsData = Array.isArray(data) ? data : [];
    setMissions(missionsData);
    setTotalEntries(missionsData.length || 0);
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

/**
 * Fonction pour récupérer une mission par son ID.
 * (Fonction existante - conservée)
 */
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
    const data = await apiGet(`/api/Mission/${missionId}`);
    setMission(data);
  } catch (error) {
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

/**
 * Fonction pour annuler une mission.
 * (Fonction existante - conservée)
 */
// La fonction prend maintenant userId en paramètre
export const cancelMission = async (
  missionId,
  setIsLoading,
  onSuccess,
  onError
) => {
  try {
    setIsLoading((prev) => ({ ...prev, missions: true }));

    await apiPut(`/api/Mission/${missionId}/cancel/${userId}`, null);

    onSuccess({
      isOpen: true,
      type: "success",
      message: `Mission ${missionId} annulée avec succès.`,
    });
  } catch (error) {
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


// ----------------------------------------------------------------------
// SERVICES STATISTIQUES ET UTILITAIRES
// ----------------------------------------------------------------------

/**
 * Fonction pour récupérer les statistiques des missions.
 * (Fonction existante - conservée)
 */
export const fetchMissionStats = async (setStats, setIsLoading, onError) => {
  try {
    setIsLoading((prev) => ({ ...prev, stats: true }));
    const data = await apiGet("/api/Mission/stats");
    setStats(data);
  } catch (error) {
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

/**
 * Fonction utilitaire pour récupérer l'ID d'une mission à partir de son nom.
 * (Fonction existante - conservée)
 */
export const getMissionId = (name, missions) =>
  missions.find((mission) => mission.name === name)?.missionId || "";