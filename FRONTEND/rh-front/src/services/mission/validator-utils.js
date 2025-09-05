import { useCallback } from "react";
import { apiGet, apiPost } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";

// Generate initials for avatar
export const getInitials = (name) => {
  const cleanName = name.replace(/\s*\([^)]+\)\s*/g, "").trim();
  const nameParts = cleanName.split(/\s+/);
  const firstInitial = nameParts[0] ? nameParts[0][0] : "J";
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "D";
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Format validator data
export const formatValidatorData = (validator, role) => {
  if (!validator) return null;
  return {
    name: validator.name || "Non spécifié",
    initials: getInitials(validator.name || "John Doe"),
    email: validator.email || "Non spécifié",
    department: validator.department || "Non spécifié",
    position: validator.position || role || "Non spécifié",
  };
};

// Fetch mission validations by assignation ID
export const useGetMissionValidationsByAssignationId = () => {
  return useCallback(async (assignationId) => {
    if (!assignationId) {
      throw new Error("Assignation ID is required");
    }
    
    try {
      const response = await apiGet(`/api/MissionValidation/by-assignation-id/${assignationId}`);
      const data = Array.isArray(response) ? response : [];
      
      const formattedData = data.map((validation, index) => {
        const formattedValidation = {
          missionValidationId: validation.missionValidationId,
          status: validation.status || "Non défini",
          toWhom: validation.toWhom || "Non spécifié",
          createdAt: validation.createdAt,
          missionAssignationId: validation.missionAssignationId,
          validator: validation.toWhom === "DRH" 
            ? formatValidatorData(validation.drh, "DRH")
            : formatValidatorData(validation.superior, "Directeur de tutelle"),
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

// Validate mission request using userId from localStorage
export const useValidateMissionRequest = () => {
  return useCallback(async () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;

    if (!userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }

    try {
      const response = await apiPost(`/api/MissionValidation/requests/${userId}`, {});
      return response;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

// Validate a mission using missionValidationId, missionAssignationId, and userId
export const useValidateMission = () => {
  return useCallback(async (missionValidationId, missionAssignationId, action, comment = "", signature = "") => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.userId;

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
      const payload = {
        action,
        comment,
        signature,
      };

      const response = await apiPost(
        `/api/MissionValidation/validate/${missionValidationId}/${missionAssignationId}?userId=${userId}`,
        payload
      );

      return response;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};