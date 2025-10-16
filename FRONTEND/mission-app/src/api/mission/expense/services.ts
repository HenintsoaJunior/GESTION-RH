import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios-config';
import axios from 'axios';

// Query keys
const EXPENSE_REPORT_TYPES_BASE_KEY = ['expenseReportTypes'] as const;
const EXPENSE_REPORTS_BY_ASSIGNATION_BASE_KEY = ['expenseReportsByAssignation'] as const;
const TOTAL_REIMBURSED_AMOUNT_BASE_KEY = ['totalReimbursedAmount'] as const;
const TOTAL_NOT_REIMBURSED_AMOUNT_BASE_KEY = ['totalNotReimbursedAmount'] as const;
const TOTAL_REIMBURSED_COUNT_BASE_KEY = ['totalReimbursedCount'] as const;
const TOTAL_NOT_REIMBURSED_COUNT_BASE_KEY = ['totalNotReimbursedCount'] as const;
const TOTAL_AMOUNT_BY_ASSIGNATION_BASE_KEY = ['totalAmountByAssignation'] as const;
const STATUS_BY_ASSIGNATION_BASE_KEY = ['statusByAssignation'] as const;
const DISTINCT_MISSION_ASSIGNATIONS_BASE_KEY = ['distinctMissionAssignations'] as const;

// Interfaces for nested objects
interface Employee {
  employeeId: string;
  employeeCode: string | null;
  lastName: string | null;
  firstName: string | null;
  phoneNumber: string | null;
  hireDate: string | null;
  jobTitle: string | null;
  contractEndDate: string | null;
  status: string | null;
  siteId: string | null;
  genderId: string | null;
  contractTypeId: string | null;
  directionId: string | null;
  departmentId: string | null;
  serviceId: string | null;
  unitId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface MissionAssignation {
  assignationId: string;
  employeeId: string | null;
  missionId: string | null;
  transportId: string | null;
  departureDate: string | null;
  departureTime: string | null;
  returnDate: string | null;
  returnTime: string | null;
  duration: number;
  isValidated: number;
  employee: Employee | null;
  mission: unknown | null;
  transport: unknown | null;
  type: string;
  allocatedFund: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExpenseReport {
  expenseReportId: string;
  userId: string;
  assignationId: string;
  status: string;
  totalAmount: number;
  isReimbursed: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExpenseReportType {
  expenseReportTypeId: string;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExpenseLine {
  expenseReportId: string;
  titled: string;
  description: string | null;
  type: string;
  currencyUnit: string;
  amount: number;
  rate: number;
  assignationId: string;
  expenseReportTypeId: string;
  userId: string;
  customFields: Record<string, unknown>;
}

export interface Attachment {
  fileName: string;
  fileContent: string;
  fileSize: number;
  fileType: string;
}

// Generic API response interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Specific response interfaces
interface ExpenseReportTypesResponseData {
  data: ExpenseReportType[];
}

interface ExpenseReportsResponseData {
  data: ExpenseReport[];
}

interface TotalReimbursedAmountResponseData {
  totalReimbursedAmount: number;
}

interface TotalNotReimbursedAmountResponseData {
  totalNotReimbursedAmount: number;
}

interface TotalReimbursedCountResponseData {
  totalReimbursedCount: number;
}

interface TotalNotReimbursedCountResponseData {
  totalNotReimbursedCount: number;
}

interface TotalAmountByAssignationResponseData {
  totalAmount: number;
}

interface StatusByAssignationResponseData {
  data: string[];
}

interface DistinctMissionAssignationsResponseData {
  items: MissionAssignation[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

interface CreateExpenseReportResponseData {
  affectedIds: string[];
}

interface ReimburseResponseData {
  affectedIds?: string[];
  message?: string;
}

// Request interfaces
export interface CreateExpenseReportRequest {
  userId: string;
  assignationId: string;
  expenseLinesByType: Record<string, ExpenseLine[]>;
  attachments: Attachment[];
}

// Hook for fetching all expense report types
export const useAllExpenseReportTypes = () => {
  return useQuery<ApiResponse<ExpenseReportTypesResponseData>, Error>({
    queryKey: EXPENSE_REPORT_TYPES_BASE_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseReportType');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

// Hook for fetching expense reports by assignation ID
export const useExpenseReportsByAssignationId = (assignationId?: string) => {
  return useQuery<ApiResponse<ExpenseReportsResponseData>, Error>({
    queryKey: [...EXPENSE_REPORTS_BY_ASSIGNATION_BASE_KEY, assignationId],
    queryFn: async () => {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      try {
        const response = await api.get(`/api/ExpenseReport/assignation/${assignationId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!assignationId,
  });
};

// Hook for total reimbursed amount
export const useTotalReimbursedAmount = () => {
  return useQuery<ApiResponse<TotalReimbursedAmountResponseData>, Error>({
    queryKey: TOTAL_REIMBURSED_AMOUNT_BASE_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseReport/total-reimbursed');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

// Hook for total not reimbursed amount
export const useTotalNotReimbursedAmount = () => {
  return useQuery<ApiResponse<TotalNotReimbursedAmountResponseData>, Error>({
    queryKey: TOTAL_NOT_REIMBURSED_AMOUNT_BASE_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseReport/total-notreimbursed');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

// Hook for total reimbursed count
export const useTotalReimbursedCount = () => {
  return useQuery<ApiResponse<TotalReimbursedCountResponseData>, Error>({
    queryKey: TOTAL_REIMBURSED_COUNT_BASE_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseReport/count-reimbursed');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

// Hook for total not reimbursed count
export const useTotalNotReimbursedCount = () => {
  return useQuery<ApiResponse<TotalNotReimbursedCountResponseData>, Error>({
    queryKey: TOTAL_NOT_REIMBURSED_COUNT_BASE_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseReport/count-notreimbursed');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

// Hook for total amount by assignation ID
export const useTotalAmountByAssignationId = (assignationId?: string) => {
  return useQuery<ApiResponse<TotalAmountByAssignationResponseData>, Error>({
    queryKey: [...TOTAL_AMOUNT_BY_ASSIGNATION_BASE_KEY, assignationId],
    queryFn: async () => {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      try {
        const response = await api.get(`/api/ExpenseReport/total-amount/${assignationId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!assignationId,
  });
};

// Hook for distinct statuses by assignation ID
export const useStatusByAssignationId = (assignationId?: string) => {
  return useQuery<ApiResponse<StatusByAssignationResponseData>, Error>({
    queryKey: [...STATUS_BY_ASSIGNATION_BASE_KEY, assignationId],
    queryFn: async () => {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      try {
        const response = await api.get(`/api/ExpenseReport/status/${assignationId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!assignationId,
  });
};

// Hook for creating a new expense report
export const useCreateExpenseReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<CreateExpenseReportResponseData>, Error, CreateExpenseReportRequest>({
    mutationFn: async (data) => {
      try {
        const response = await api.post('/api/ExpenseReport', data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_REPORT_TYPES_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_COUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_COUNT_BASE_KEY });
    },
  });
};

// Hook for reimbursing expense reports by assignation ID
export const useReimburseByAssignationId = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ReimburseResponseData>, Error, { assignationId: string; userId: string }>({
    mutationFn: async ({ assignationId, userId }) => {
      if (!assignationId) {
        throw new Error("assignationId est requis.");
      }
      if (!userId) {
        throw new Error("userId est requis.");
      }
      try {
        const response = await api.post(`/api/ExpenseReport/reimburse/${assignationId}?userId=${userId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, { assignationId }) => {
      queryClient.invalidateQueries({ queryKey: [...EXPENSE_REPORTS_BY_ASSIGNATION_BASE_KEY, assignationId] });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_COUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_COUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: [...TOTAL_AMOUNT_BY_ASSIGNATION_BASE_KEY, assignationId] });
      queryClient.invalidateQueries({ queryKey: [...STATUS_BY_ASSIGNATION_BASE_KEY, assignationId] });
    },
  });
};

// Hook for getting distinct mission assignations with optional status filter and pagination
export const useDistinctMissionAssignations = (options: { status?: string; pageNumber?: number; pageSize?: number } = {}) => {
  const { status, pageNumber = 1, pageSize = 10 } = options;
  const queryKey = [
    ...DISTINCT_MISSION_ASSIGNATIONS_BASE_KEY,
    { status, pageNumber, pageSize }
  ];

  return useQuery<ApiResponse<DistinctMissionAssignationsResponseData>, Error>({
    queryKey,
    queryFn: async () => {
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (status) queryParams.append("Status", status);
        queryParams.append("pageNumber", pageNumber.toString());
        queryParams.append("pageSize", pageSize.toString());

        const response = await api.get(`/api/ExpenseReport/distinct-mission-assignations?${queryParams}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};