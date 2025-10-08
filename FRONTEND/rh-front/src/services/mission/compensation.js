import { apiGet, apiPost,apiPut } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";
import { useCallback } from "react";

// Format compensation data to ensure consistent structure
/**
 * @param {any} compensation - Raw compensation data from API
 * @returns {Object|null} - Formatted compensation object or null if invalid
 */
export const formatCompensationData = (compensation) => {
  if (!compensation || !compensation.compensationId) return null;
  return {
    compensationId: compensation.compensationId || "Non spécifié",
    transportAmount: compensation.transportAmount || 0,
    breakfastAmount: compensation.breakfastAmount || 0,
    lunchAmount: compensation.lunchAmount || 0,
    dinnerAmount: compensation.dinnerAmount || 0,
    accommodationAmount: compensation.accommodationAmount || 0,
    totalAmount: (compensation.transportAmount || 0) + (compensation.breakfastAmount || 0) + (compensation.lunchAmount || 0) + (compensation.dinnerAmount || 0) + (compensation.accommodationAmount || 0),
    paymentDate: compensation.paymentDate || new Date().toISOString(),
    status: compensation.status || "not paid",
    assignationId: compensation.assignationId || "Non spécifié",
    employee: {
      employeeId: compensation.employee?.employeeId || "Non spécifié",
      employeeCode: compensation.employee?.employeeCode || "Non spécifié",
      lastName: compensation.employee?.lastName || "Non spécifié",
      firstName: compensation.employee?.firstName || "Non spécifié",
      phoneNumber: compensation.employee?.phoneNumber || "Non spécifié",
      jobTitle: compensation.employee?.jobTitle || "Non spécifié",
      status: compensation.employee?.status || "Actif",
    },
    createdAt: compensation.createdAt || new Date().toISOString(),
    updatedAt: compensation.updatedAt || null,
  };
};

// Format assignation data to ensure consistent structure
/**
 * @param {any} assignation - Raw assignation data from API
 * @returns {Object|null} - Formatted assignation object or null if invalid
 */
export const formatAssignationData = (assignation) => {
  if (!assignation || !assignation.assignationId) return null;
  return {
    assignationId: assignation.assignationId || "Non spécifié",
    employeeId: assignation.employeeId || "Non spécifié",
    missionId: assignation.missionId || "Non spécifié",
    transportId: assignation.transportId || null,
    departureDate: assignation.departureDate || new Date().toISOString(),
    departureTime: assignation.departureTime || "00:00:00",
    returnDate: assignation.returnDate || new Date().toISOString(),
    returnTime: assignation.returnTime || "00:00:00",
    duration: assignation.duration || 0,
    isValidated: assignation.isValidated || null,
    employee: {
      employeeId: assignation.employee?.employeeId || "Non spécifié",
      employeeCode: assignation.employee?.employeeCode || "Non spécifié",
      lastName: assignation.employee?.lastName || "Non spécifié",
      firstName: assignation.employee?.firstName || "Non spécifié",
      phoneNumber: assignation.employee?.phoneNumber || "Non spécifié",
      jobTitle: assignation.employee?.jobTitle || "Non spécifié",
      status: assignation.employee?.status || "Actif",
      siteName: assignation.employee?.site?.siteName || "Non spécifié",
      directionName: assignation.employee?.direction?.directionName || "Non spécifié",
      departmentName: assignation.employee?.department?.departmentName || "Non spécifié",
      serviceName: assignation.employee?.service?.serviceName || "Non spécifié",
    },
    mission: {
      missionId: assignation.mission?.missionId || "Non spécifié",
      missionType: assignation.mission?.missionType || "Non spécifié",
      name: assignation.mission?.name || "Non spécifié",
      description: assignation.mission?.description || "Non spécifié",
      status: assignation.mission?.status || "Non spécifié",
      startDate: assignation.mission?.startDate || new Date().toISOString(),
      endDate: assignation.mission?.endDate || new Date().toISOString(),
      lieu: {
        nom: assignation.mission?.lieu?.nom || "Non spécifié",
        pays: assignation.mission?.lieu?.pays || "Non spécifié",
      },
    },
    transport: assignation.transport || null,
    type: assignation.type || "Indemnité",
    allocatedFund: assignation.allocatedFund || 0,
    createdAt: assignation.createdAt || new Date().toISOString(),
    updatedAt: assignation.updatedAt || null,
  };
};

/**
 * Hook to get total paid amount for all compensations
 * @returns {Function} - Function to fetch total paid amount
 */
export const GetTotalPaidAmount = () => {
  return useCallback(async () => {
    try {
      const response = await apiGet(`/api/Compensation/total-paid`);
      return response.totalPaidAmount || 0;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};


export const GetTotalNotPaidAmount = () => {
  return useCallback(async () => {
    try {
      const response = await apiGet(`/api/Compensation/total-notpaid`);

      return response.totalNotPaidAmount || 0;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Hook to get compensations by employee and mission
/**
 * @returns {Function} - Function to fetch compensations by employee and mission
 */
export const GetCompensationsByEmployeeAndMission = () => {
  return useCallback(async (employeeId, missionId) => {
    if (!employeeId) {
      throw new Error("Employee ID is required");
    }
    if (!missionId) {
      throw new Error("Mission ID is required");
    }
    try {
      const response = await apiGet(`/api/Compensation/by-employee/${employeeId}/mission/${missionId}`);
      const formattedAssignation = formatAssignationData(response.assignation);
      const compensationsData = Array.isArray(response.compensations) ? response.compensations : [];
      const formattedCompensations = compensationsData
        .map((comp) => formatCompensationData(comp))
        .filter((comp) => comp !== null);
      return {
        assignation: formattedAssignation,
        compensations: formattedCompensations,
        totalAmount: formattedCompensations.reduce((sum, comp) => sum + comp.totalAmount, 0),
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Hook to get compensations by status
/**
 * @returns {Function} - Function to fetch compensations by status (null for all with compensations)
 */
export const GetCompensationsByStatus = () => {
  return useCallback(async (status) => {
    try {
      const queryParam = status ? `?status=${encodeURIComponent(status)}` : '';
      const response = await apiGet(`/api/Compensation/by-status${queryParam}`);
      
      // Ensure response is an array
      const dataArray = Array.isArray(response) ? response : [];
      
      // Process each item in the array
      const processedItems = dataArray
        .map((item) => {
          if (!item || !item.assignation) return null;
          
          const formattedAssignation = formatAssignationData(item.assignation);
          const compensationsData = Array.isArray(item.compensations) ? item.compensations : [];
          const formattedCompensations = compensationsData
            .map((comp) => formatCompensationData(comp))
            .filter((comp) => comp !== null);
          
          return {
            assignation: formattedAssignation,
            compensations: formattedCompensations,
            totalAmount: formattedCompensations.reduce((sum, comp) => sum + comp.totalAmount, 0),
          };
        })
        .filter((item) => item !== null);
      
      return processedItems;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};


/**
 * Hook to update compensation status for a specific employee and assignation
 * @returns {Function} - Function to update compensation status
 */
export const UpdateCompensationStatus = () => {
  return useCallback(async (employeeId, assignationId, status) => {
    if (!employeeId) {
      throw new Error("Employee ID is required");
    }
    if (!assignationId) {
      throw new Error("Assignation ID is required");
    }
    if (!status) {
      throw new Error("Status is required");
    }
    try {
      const response = await apiPut(`/api/Compensation/${employeeId}/${assignationId}/status`, status);
      return response.message;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
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
      '/api/Compensation/generate-excel',
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