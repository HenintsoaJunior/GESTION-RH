import { apiPost, apiGet, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";
import { useCallback } from "react";

/**
 * Format form data for mission report insertion or update to match backend expectations
 * @param {Object} formData - Raw form data from React state (e.g., { text, userId, assignationId })
 * @returns {Object} - Formatted payload for API post or put
 */
export const formatMissionReportForInsertion = (formData) => {
  if (!formData || !formData.userId || !formData.assignationId || !formData.text) {
    throw new Error("text, userId, and assignationId are required.");
  }

  return {
    text: formData.text,
    userId: formData.userId,
    assignationId: formData.assignationId,
  };
};

/**
 * Hook to create a new mission report
 * @returns {Function} - Function to create mission report with formatted data
 */
export const CreateMissionReport = () => {
  return useCallback(async (rawFormData) => {
    try {
      const formattedPayload = formatMissionReportForInsertion(rawFormData);
      const response = await apiPost(`/api/MissionReport`, formattedPayload);
      return response.missionReportId || null;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to update an existing mission report
 * @returns {Function} - Function to update mission report with formatted data
 */
export const UpdateMissionReport = () => {
  return useCallback(async (missionReportId, rawFormData) => {
    try {
      if (!missionReportId) {
        throw new Error("missionReportId is required for update.");
      }
      const formattedPayload = formatMissionReportForInsertion(rawFormData);
      const response = await apiPut(`/api/MissionReport/${missionReportId}`, formattedPayload, {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      });
      return response.missionReportId || null;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to delete a mission report
 * @returns {Function} - Function to delete a mission report by ID
 */
export const DeleteMissionReport = () => {
  return useCallback(async (missionReportId, userId) => {
    try {
      if (!missionReportId) {
        throw new Error("missionReportId is required for deletion.");
      }
      if (!userId) {
        throw new Error("userId is required for deletion.");
      }

      await apiDelete(`/api/MissionReport/${missionReportId}?userId=${encodeURIComponent(userId)}`, {
        headers: {
          Accept: '*/*',
        },
      });
      return true; // Indicate successful deletion
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to fetch mission reports, optionally filtered by assignationId
 * @returns {Function} - Function to fetch mission reports from the API
 */
export const FetchMissionReports = () => {
  return useCallback(async (assignationId = null) => {
    try {
      const url = assignationId
        ? `/api/MissionReport?assignationId=${encodeURIComponent(assignationId)}`
        : `/api/MissionReport`;
      const response = await apiGet(url, {
        headers: {
          Accept: 'text/plain',
        },
      });
      return response || [];
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};