import { apiGet, apiPost, apiPut, apiDelete } from "utils/apiUtils";
import { handleValidationError } from "utils/validation";
import { useCallback } from "react";

// Format expense report type data to ensure consistent structure
/**
 * @param {any} expenseReportType - Raw expense report type data from API
 * @returns {Object|null} - Formatted expense report type object or null if invalid
 */
export const formatExpenseReportTypeData = (expenseReportType) => {
  if (!expenseReportType || !expenseReportType.expenseReportTypeId) return null;
  return {
    expenseReportTypeId: expenseReportType.expenseReportTypeId || "Non spécifié",
    type: expenseReportType.type || "Non spécifié",
    createdAt: expenseReportType.createdAt || new Date().toISOString(),
    updatedAt: expenseReportType.updatedAt || null,
  };
};

/**
 * Hook to get all expense report types
 * @returns {Function} - Function to fetch all expense report types
 */
export const GetAllExpenseReportTypes = () => {
  return useCallback(async () => {
    try {
      const response = await apiGet(`/api/ExpenseReportType`);
      const dataArray = Array.isArray(response) ? response : [];
      const formattedTypes = dataArray
        .map((type) => formatExpenseReportTypeData(type))
        .filter((type) => type !== null);
      return formattedTypes;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to get expense report type by ID
 * @returns {Function} - Function to fetch expense report type by ID
 */
export const GetExpenseReportTypeById = () => {
  return useCallback(async (id) => {
    if (!id) {
      throw new Error("L'ID du type de rapport de frais est requis");
    }
    try {
      const response = await apiGet(`/api/ExpenseReportType/${id}`);
      return formatExpenseReportTypeData(response);
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to create a new expense report type
 * @returns {Function} - Function to create expense report type
 */
export const CreateExpenseReportType = () => {
  return useCallback(async (data) => {
    if (!data || !data.type) {
      throw new Error("Le type est requis pour la création");
    }
    try {
      const payload = {
        type: data.type,
      };
      const response = await apiPost(`/api/ExpenseReportType`, payload);
      return response; // Returns the created ID
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to update an expense report type
 * @returns {Function} - Function to update expense report type
 */
export const UpdateExpenseReportType = () => {
  return useCallback(async (id, data) => {
    if (!id) {
      throw new Error("L'ID du type de rapport de frais est requis");
    }
    if (!data || !data.type) {
      throw new Error("Le type est requis pour la mise à jour");
    }
    try {
      const payload = {
        type: data.type,
      };
      const response = await apiPut(`/api/ExpenseReportType/${id}`, payload);
      return response; // Returns success boolean or message
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to delete an expense report type
 * @returns {Function} - Function to delete expense report type
 */
export const DeleteExpenseReportType = () => {
  return useCallback(async (id, userId) => {
    if (!id) {
      throw new Error("L'ID du type de rapport de frais est requis");
    }
    if (!userId) {
      throw new Error("L'ID de l'utilisateur est requis pour la suppression");
    }
    try {
      const response = await apiDelete(`/api/ExpenseReportType/${id}?userId=${encodeURIComponent(userId)}`);
      return response; // Returns success boolean or message
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};