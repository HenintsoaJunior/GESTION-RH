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
  
  // Définir le titre et le sous-titre en fonction du type
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
          type: validation.type 
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

// Validate mission request using userId from localStorage with pagination support
export const MissionValidationRequests = () => {
  return useCallback(async ({ page = 1, pageSize = 3 } = {}) => {
    if (!userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }
    try {
      const response = await apiPost(`/api/MissionValidation/requests/${userId}`, { page, pageSize });
      return response;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Validate a mission using missionValidationId, missionAssignationId, and userId
export const ValidateMission = () => {
  return useCallback(async (missionValidationId, missionAssignationId, action, comment = "", signature = "", missionBudget = 20000) => {
    
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
      // Nouveau format de payload selon les spécifications
      const payload = {
        missionValidationId,
        missionAssignationId,
        isSureToConfirm: true, // Toujours true car l'utilisateur a confirmé via le modal
        type: action, // "validate" ou "reject"
        userId,
        // Inclure le budget de mission si fourni
        ...(missionBudget && { missionBudget })
      };

      // Mise à jour de l'endpoint pour utiliser une route POST simple
      const response = await apiPost(
        `/api/MissionValidation/validate`,
        payload
      );
      
      return response;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};