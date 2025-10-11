import { apiGet, apiPost } from "utils/apiUtils";
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
 * Format form data for expense report insertion to match backend expectations
 * @param {Object} formData - Raw form data from React state (e.g., { userId, assignationId, expenseLinesByType, attachments })
 * @returns {Object} - Formatted payload for API post
 */
export const formatExpenseReportForInsertion = (formData) => {
  if (!formData || !formData.userId || !formData.assignationId) {
    throw new Error("userId et assignationId sont requis pour l'insertion.");
  }

  // Validate and structure expenseLinesByType
  const expenseLinesByType = {};
  if (formData.expenseLinesByType) {
    Object.keys(formData.expenseLinesByType).forEach((typeId) => {
      const lines = formData.expenseLinesByType[typeId] || [];
      expenseLinesByType[typeId] = lines
        .filter((line) => line && line.titled) // Filter invalid lines
        .map((line) => ({
          expenseReportId: line.expenseReportId || "",
          titled: line.titled || "",
          description: line.description || null,
          type: line.type || "",
          currencyUnit: line.currencyUnit || "EUR",
          amount: parseFloat(line.amount) || 0,
          rate: parseFloat(line.rate) || 0,
          assignationId: formData.assignationId,
          expenseReportTypeId: typeId,
          userId: formData.userId,
          customFields: line.customFields || {},
        }));
    });
  }

  // Validate and structure attachments
  const attachments = Array.isArray(formData.attachments)
    ? formData.attachments
        .filter((attachment) => attachment && attachment.fileName && attachment.fileContent)
        .map((attachment) => ({
          fileName: attachment.fileName || "",
          fileContent: attachment.fileContent || "",
          fileSize: Math.round(Number(attachment.fileSize)) || 0,
          fileType: attachment.fileType || "application/octet-stream",
        }))
    : [];

  return {
    userId: formData.userId,
    assignationId: formData.assignationId,
    expenseLinesByType,
    attachments,
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
 * Hook to create a new expense report
 * @returns {Function} - Function to create expense report with formatted data
 */
export const CreateExpenseReport = () => {
  return useCallback(async (rawFormData) => {
    try {
      const formattedPayload = formatExpenseReportForInsertion(rawFormData);
      const response = await apiPost(`/api/ExpenseReport`, formattedPayload);
      return response.affectedIds || [];
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to get expense reports by assignation ID
 * @returns {Function} - Function to fetch expense reports and total amount by assignation ID
 */
export const GetExpenseReportsByAssignationId = () => {
  return useCallback(async (assignationId) => {
    try {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      const response = await apiGet(`/api/ExpenseReport/assignation/${assignationId}`);
      return response;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

export const GetTotalReimbursedAmount = () => {
  return useCallback(async () => {
    try {
      const response = await apiGet(`/api/ExpenseReport/total-reimbursed`);
      return response.totalReimbursedAmount || 0;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

export const GetTotalNotReimbursedAmount = () => {
  return useCallback(async () => {
    try {
      const response = await apiGet(`/api/ExpenseReport/total-notreimbursed`);
      return response.totalNotReimbursedAmount || 0;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to get total reimbursed count
 * @returns {Function} - Function to fetch total count of reimbursed reports
 */
export const GetTotalReimbursedCount = () => {
  return useCallback(async () => {
    try {
      const response = await apiGet(`/api/ExpenseReport/count-reimbursed`);
      return response.totalReimbursedCount || 0;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to get total non-reimbursed count
 * @returns {Function} - Function to fetch total count of non-reimbursed reports
 */
export const GetTotalNotReimbursedCount = () => {
  return useCallback(async () => {
    try {
      const response = await apiGet(`/api/ExpenseReport/count-notreimbursed`);
      return response.totalNotReimbursedCount || 0;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};


/**
 * Hook to get total amount by assignation ID
 * @returns {Function} - Function to fetch total amount for a specific assignation ID
 */
export const GetTotalAmountByAssignationId = () => {
  return useCallback(async (assignationId) => {
    try {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      const response = await apiGet(`/api/ExpenseReport/total-amount/${assignationId}`);
      return response.totalAmount || 0;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to reimburse expense reports by assignation ID
 * @returns {Function} - Function to reimburse all expense reports for a given assignation ID
 */
export const ReimburseByAssignationId = () => {
  return useCallback(async (assignationId, userId) => {
    try {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      if (!userId) {
        throw new Error("userId est requis.");
      }
      const response = await apiPost(`/api/ExpenseReport/reimburse/${assignationId}?userId=${userId}`);
      return response;
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};

/**
 * Hook to get distinct statuses of expense reports by assignation ID
 * @returns {Function} - Function to fetch distinct statuses for a given assignation ID
 */
export const GetStatusByAssignationId = () => {
  return useCallback(async (assignationId) => {
    try {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      const response = await apiGet(`/api/ExpenseReport/status/${assignationId}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};


export const formatMissionAssignationData = (missionAssignation) => {
  if (!missionAssignation || !missionAssignation.assignationId) return null;
  return {
    assignationId: missionAssignation.assignationId || "Non spécifié",
    employeeId: missionAssignation.employeeId || null,
    missionId: missionAssignation.missionId || null,
    transportId: missionAssignation.transportId || null,
    departureDate: missionAssignation.departureDate || null,
    departureTime: missionAssignation.departureTime || null,
    returnDate: missionAssignation.returnDate || null,
    returnTime: missionAssignation.returnTime || null,
    duration: missionAssignation.duration || 0,
    isValidated: missionAssignation.isValidated || 0,
    employee: missionAssignation.employee
      ? {
          employeeId: missionAssignation.employee.employeeId || "Non spécifié",
          employeeCode: missionAssignation.employee.employeeCode || null,
          lastName: missionAssignation.employee.lastName || null,
          firstName: missionAssignation.employee.firstName || null,
          phoneNumber: missionAssignation.employee.phoneNumber || null,
          hireDate: missionAssignation.employee.hireDate || null,
          jobTitle: missionAssignation.employee.jobTitle || null,
          contractEndDate: missionAssignation.employee.contractEndDate || null,
          status: missionAssignation.employee.status || null,
          siteId: missionAssignation.employee.siteId || null,
          genderId: missionAssignation.employee.genderId || null,
          contractTypeId: missionAssignation.employee.contractTypeId || null,
          directionId: missionAssignation.employee.directionId || null,
          departmentId: missionAssignation.employee.departmentId || null,
          serviceId: missionAssignation.employee.serviceId || null,
          unitId: missionAssignation.employee.unitId || null,
          createdAt: missionAssignation.employee.createdAt || null,
          updatedAt: missionAssignation.employee.updatedAt || null,
        }
      : null,
    mission: missionAssignation.mission || null,
    transport: missionAssignation.transport || null,
    type: missionAssignation.type || "Non spécifié",
    allocatedFund: missionAssignation.allocatedFund || 0,
    createdAt: missionAssignation.createdAt || new Date().toISOString(),
    updatedAt: missionAssignation.updatedAt || null,
  };
};


/**
 * Hook to get distinct mission assignations with optional status filter and pagination
 * @returns {Function} - Function to fetch distinct mission assignations
 */
export const GetDistinctMissionAssignations = () => {
  return useCallback(async ({ status, pageNumber = 1, pageSize = 10 } = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (status) queryParams.append("Status", status);
      queryParams.append("pageNumber", pageNumber.toString());
      queryParams.append("pageSize", pageSize.toString());

      const response = await apiGet(`/api/ExpenseReport/distinct-mission-assignations?${queryParams}`);
      
      // Format the items, filtering out invalid entries
      const formattedItems = Array.isArray(response.items)
        ? response.items
            .map((item) => formatMissionAssignationData(item))
            .filter((item) => item !== null)
        : [];

      return {
        items: formattedItems,
        totalCount: response.totalCount || 0,
        pageNumber: response.pageNumber || pageNumber,
        pageSize: response.pageSize || pageSize,
      };
    } catch (error) {
      handleValidationError(error);
      throw error;
    }
  }, []);
};