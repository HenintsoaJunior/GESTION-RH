import { useCallback } from "react";
import { apiGet, apiPost } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

const userData = JSON.parse(localStorage.getItem("user"));
const userId = userData?.userId;

export const getInitials = (name) => {
  const cleanName = name.replace(/\s*\([^)]+\)\s*/g, "").trim();
  const nameParts = cleanName.split(/\s+/);
  const firstInitial = nameParts[0] ? nameParts[0][0] : "J";
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "D";
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const formatValidatorData = (validator, role) => {
  if (!validator) return null;
  
  const validatorTypes = {
    "Directeur de tutelle": {
      title: "Validation Supérieur",
      subtitle: "Hiérarchique"
    },
    "DRH": {
      title: "Validation RH",
      subtitle: "Ressources Humaines"
    }
  };

  const typeInfo = validatorTypes[role] || {
    title: "Validation",
    subtitle: role || "Non spécifié"
  };

  return {
    name: validator.name || "Non spécifié",
    initials: getInitials(validator.name || "John Doe"),
    email: validator.email || "Non spécifié",
    department: validator.department || "Non spécifié",
    position: validator.position || typeInfo.title,
    title: typeInfo.title,
    subtitle: typeInfo.subtitle
  };
};

export const useGetMissionValidationsByAssignationId = () => {
  return useCallback(async (assignationId) => {
    if (!assignationId) {
      throw new Error("Assignation ID is required");
    }
    
    try {
      const response = await apiGet(`/api/MissionValidation/by-assignation-id/${assignationId}`);
      const data = Array.isArray(response) ? response : [];
      
      const formattedData = data.map((validation) => {
        const formattedValidation = {
          missionValidationId: validation.missionValidationId,
          status: validation.status || "Non défini",
          toWhom: validation.toWhom || "Non spécifié",
          createdAt: validation.createdAt,
          missionAssignationId: validation.missionAssignationId,
          validator: formatValidatorData(validation.validator, validation.type),
          type: validation.type ,
          validationDate: validation.validationDate || null,
        };
        
        return formattedValidation;
      });
      
      return formattedData;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

export const MissionValidationRequests = (userId) => {
  return useCallback(
    async ({ page = 1, pageSize = 10, employeeId = null, status = null } = {}) => {
      if (!userId) {
        throw new Error("User ID is required. Please ensure you are logged in.");
      }

      try {
        console.log("Paramètres reçus dans MissionValidationRequests:", {
          page,
          pageSize,
          employeeId,
          status,
        });

        const queryParams = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(employeeId && { employeeId }),
          ...(status && { status }),
        });

        const url = `/api/MissionValidation/requests/${userId}?${queryParams.toString()}`;
        console.log("API URL:", url);
        const response = await apiGet(url);
        console.log("API response:", response);
        return response;
      } catch (error) {
        console.error("Erreur dans MissionValidationRequests:", error);
        handleValidationError(error);
        throw error;
      }
    },
    [userId]
  );
};

export const ValidateMission = () => {
  return useCallback(async (missionValidationId, missionAssignationId, action,type, comment = "", signature = "", missionBudget = 20000) => {
    if (!missionValidationId || !missionAssignationId) {
      throw new Error("Mission Validation ID and Mission Assignation ID are required");
    }
    if (!userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }
    if (!["validate", "reject"].includes(action)) {
      throw new Error("Invalid action. Must be 'validate' or 'reject'");
    }

    try {
      // Prepare the payload
      const payload = {
        missionValidationId,
        missionAssignationId,
        userId,
        // Include type, missionBudget, and isSureToConfirm only for validation
        ...(action === "validate" && {
          type: type, 
          ...(missionBudget && { missionBudget }),
          isSureToConfirm: true
        })
      };

      // Determine the endpoint based on the action
      const endpoint = action === "validate" ? "/api/MissionValidation/validate" : "/api/MissionValidation/reject";

      // Make the POST request
      const response = await apiPost(endpoint, payload);
      
      return response;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

export const fetchMissionValidationStats = async (setStats, setIsLoading, onError, matricule = null) => {
  try {
    setIsLoading((prev) => ({ ...prev, stats: true }));
    
    const url = matricule ? `/api/MissionValidation/stats/${matricule}` : `/api/MissionValidation/stats`;
    
    const data = await apiGet(url);
    
    const transformedStats = {
      total: data?.total ?? 0,
      pending: data?.enAttente ?? 0,
      approved: data?.approuvee ?? 0,
      rejected: data?.rejetee ?? 0,
    };
    
    setStats(transformedStats);
  } catch (error) {
    onError({
      isOpen: true,
      type: "error",
      message: `Erreur lors du chargement des statistiques: ${error.message || "Une erreur inconnue s'est produite."}`,
    });
    setStats({ total: 0, pending: 0, approved: 0, rejected: 0 });
  } finally {
    setIsLoading((prev) => ({ ...prev, stats: false }));
  }
};