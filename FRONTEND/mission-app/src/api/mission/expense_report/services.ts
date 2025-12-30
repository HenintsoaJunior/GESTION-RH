/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios-config';
import axios from 'axios';

// Query keys
const EXPENSE_REPORT_KEY = ['expense-report', 'total-notreimbursed'] as const;
const EXPENSE_REPORT_TYPES_BASE_KEY = ['expenseReportTypes'] as const;
const EXPENSE_REPORTS_BY_MISSION_BASE_KEY = ['expenseReportsByMission'] as const;
const TOTAL_REIMBURSED_AMOUNT_BASE_KEY = ['totalReimbursedAmount'] as const;
const TOTAL_NOT_REIMBURSED_AMOUNT_BASE_KEY = ['totalNotReimbursedAmount'] as const;
const TOTAL_REIMBURSED_COUNT_BASE_KEY = ['totalReimbursedCount'] as const;
const TOTAL_NOT_REIMBURSED_COUNT_BASE_KEY = ['totalNotReimbursedCount'] as const;
const TOTAL_AMOUNT_BY_MISSION_BASE_KEY = ['totalAmountByMission'] as const;
const STATUS_BY_MISSION_BASE_KEY = ['statusByMission'] as const;
const DISTINCT_MISSIONS_BASE_KEY = ['distinctMissions'] as const;
const EXPENSE_REPORTS_BY_STATUS_BASE_KEY = ['expenseReportsByStatus'] as const;

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

export interface Mission {
  missionId: string;
  employeeId: string | null;
  transportId: string | null;
  departureDate: string | null;
  departureTime: string | null;
  returnDate: string | null;
  returnTime: string | null;
  duration: number;
  isValidated: number;
  employee: Employee | null;
  transport: unknown | null;
  type: string;
  allocatedFund: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExpenseReport {
  expenseReportId: string;
  userId: string;
  missionId: string;
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
  fields?: Array<{
    name: keyof ExpenseLine;
    label: string;
    type: "text" | "number" | "select";
    required: boolean;
    placeholder?: string;
    width?: string;
    options?: string[];
  }>;
}

export interface ExpenseLine {
  expenseReportId?: string;
  titled: string;
  description: string | null;
  type: string;
  currencyUnit: string;
  amount: number;
  amountMGA: number;
  rate: number;
  missionId?: string;
  expenseReportTypeId?: string;
  userId?: string;
  customFields: Record<string, unknown>;
}

export interface TotalNotReimbursed {
  totalNotReimbursedAmount: number;
}

export interface Attachment {
  fileName: string;
  fileContent: string;
  fileSize: number;
  fileType: string;
}

export interface ExpenseSummary {
  missionId: string;
  missionTitled: string;
  status: string;
  employeeName: string;
  employeeCode: string;
  lieuName: string;
  createdAt: string;
  totalAmount: number;
}

// Generic API response interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Specific response types
export type ExpenseReportTypesResponseData = ExpenseReportType[];

export type ExpenseReportsResponseData = {
  reports: ExpenseReport[];
  attachments: Attachment[];
}[];

type TotalReimbursedAmountResponseData = {
  totalReimbursedAmount: number;
};

type TotalNotReimbursedAmountResponseData = {
  totalNotReimbursedAmount: number;
};

type TotalReimbursedCountResponseData = {
  totalReimbursedCount: number;
};

type TotalNotReimbursedCountResponseData = {
  totalNotReimbursedCount: number;
};

type TotalAmountByMissionResponseData = {
  totalAmount: number;
};

export type StatusByMissionResponseData = string[];

type DistinctMissionsResponseData = {
  items: Mission[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

type CreateExpenseReportResponseData = {
  affectedIds: string[];
};

type ReimburseResponseData = {
  affectedIds?: string[];
  message?: string;
};

type ByStatusResponseData = {
  reports: ExpenseSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

type TotalNotReimbursedResponse = ApiResponse<TotalNotReimbursed>;

// Request interfaces
export interface CreateExpenseReportRequest {
  userId: string;
  missionId: string;
  expenseLinesByType: Record<string, ExpenseLine[]>;
  attachments: Attachment[];
}

// Helper function to map data to API format (PascalCase)
const mapToApiFormat = (data: CreateExpenseReportRequest) => {
  return {
    UserId: data.userId,
    MissionId: data.missionId,
    ExpenseLinesByType: Object.entries(data.expenseLinesByType).reduce((acc, [key, lines]) => {
      acc[key] = lines.map(line => ({
        Titled: line.titled,
        Description: line.description,
        Type: line.type,
        CurrencyUnit: line.currencyUnit,
        Amount: typeof line.amount === 'string' ? parseFloat(line.amount) : line.amount,
        Rate: typeof line.rate === 'string' ? parseFloat(line.rate) : line.rate,
        CustomFields: line.customFields || {},
        // Propagate top-level IDs to each line to satisfy backend validation
        UserId: data.userId,
        MissionId: data.missionId,
      }));
      return acc;
    }, {} as Record<string, any>),
    Attachments: data.attachments.map(att => ({
      FileName: att.fileName,
      FileContent: att.fileContent,
      FileSize: att.fileSize,
      FileType: att.fileType,
    })),
  };
};

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

// Hook for creating a new expense report
export const useCreateExpenseReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<CreateExpenseReportResponseData>, Error, CreateExpenseReportRequest>({
    mutationFn: async (data) => {
      try {
        const apiPayload = mapToApiFormat(data);
        
        const response = await api.post('/api/ExpenseReport', apiPayload);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || "Erreur lors de la création du rapport");
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      const { missionId } = variables;
      queryClient.invalidateQueries({ queryKey: [...EXPENSE_REPORTS_BY_MISSION_BASE_KEY, missionId] });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_COUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_COUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: [...TOTAL_AMOUNT_BY_MISSION_BASE_KEY, missionId] });
      queryClient.invalidateQueries({ queryKey: [...STATUS_BY_MISSION_BASE_KEY, missionId] });
    },
  });
};

// Hook for fetching expense reports by mission ID
export const useExpenseReportsByMissionId = (missionId?: string) => {
  return useQuery<ApiResponse<ExpenseReportsResponseData>, Error>({
    queryKey: [...EXPENSE_REPORTS_BY_MISSION_BASE_KEY, missionId],
    queryFn: async () => {
      if (!missionId) {
        throw new Error("missionId est requis.");
      }
      try {
        const response = await api.get(`/api/ExpenseReport/mission/${missionId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!missionId,
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

// Hook for total amount by mission ID
export const useTotalAmountByMissionId = (missionId?: string) => {
  return useQuery<ApiResponse<TotalAmountByMissionResponseData>, Error>({
    queryKey: [...TOTAL_AMOUNT_BY_MISSION_BASE_KEY, missionId],
    queryFn: async () => {
      if (!missionId) {
        throw new Error("missionId est requis.");
      }
      try {
        const response = await api.get(`/api/ExpenseReport/total-amount/${missionId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!missionId,
  });
};

// Hook for distinct statuses by mission ID
export const useStatusByMissionId = (missionId?: string) => {
  return useQuery<ApiResponse<StatusByMissionResponseData>, Error>({
    queryKey: [...STATUS_BY_MISSION_BASE_KEY, missionId],
    queryFn: async () => {
      if (!missionId) {
        throw new Error("missionId est requis.");
      }
      try {
        const response = await api.get(`/api/ExpenseReport/status/${missionId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!missionId,
  });
};

// Hook for reimbursing expense reports by mission ID
export const useReimburseByMissionId = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ReimburseResponseData>, Error, { missionId: string; userId: string }>({
    mutationFn: async ({ missionId, userId }) => {
      if (!missionId) {
        throw new Error("missionId est requis.");
      }
      if (!userId) {
        throw new Error("userId est requis.");
      }
      try {
        const response = await api.post(`/api/ExpenseReport/reimburse/mission/${missionId}?userId=${userId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, { missionId }) => {
      queryClient.invalidateQueries({ queryKey: [...EXPENSE_REPORTS_BY_MISSION_BASE_KEY, missionId] });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_AMOUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_REIMBURSED_COUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_REIMBURSED_COUNT_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: [...TOTAL_AMOUNT_BY_MISSION_BASE_KEY, missionId] });
      queryClient.invalidateQueries({ queryKey: [...STATUS_BY_MISSION_BASE_KEY, missionId] });
      queryClient.invalidateQueries({ queryKey: [...EXPENSE_REPORTS_BY_STATUS_BASE_KEY, missionId] });
    },
  });
};

// Hook for getting distinct missions with optional status filter and pagination
export const useDistinctMissions = (options: { status?: string; pageNumber?: number; pageSize?: number } = {}) => {
  const { status, pageNumber = 1, pageSize = 10 } = options;
  const queryKey = [
    ...DISTINCT_MISSIONS_BASE_KEY,
    { status, pageNumber, pageSize }
  ];

  return useQuery<ApiResponse<DistinctMissionsResponseData>, Error>({
    queryKey,
    queryFn: async () => {
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (status) queryParams.append("Status", status);
        queryParams.append("pageNumber", pageNumber.toString());
        queryParams.append("pageSize", pageSize.toString());

        const response = await api.get(`/api/ExpenseReport/distinct-missions?${queryParams}`);
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

// Dans votre fichier @/api/mission/expense_report/services.ts
export const useExpenseReportsByFilters = (
  filters: {
    status?: string;
    employeeName?: string;
    employeeCode?: string;  // AJOUTEZ CETTE LIGNE
    missionType?: string;
    paymentDateMin?: string;
    paymentDateMax?: string;
    page?: number;
    pageSize?: number;
  } = {}
) => {
  const {
    status,
    employeeName,
    employeeCode,  // AJOUTEZ CETTE LIGNE
    missionType,
    paymentDateMin,
    paymentDateMax,
    page = 1,
    pageSize = 10
  } = filters;

  const queryKey = [
    ...EXPENSE_REPORTS_BY_STATUS_BASE_KEY,
    { status, employeeName, employeeCode, missionType, paymentDateMin, paymentDateMax, page, pageSize }
  ];

  return useQuery<ApiResponse<ByStatusResponseData>, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        
        if (status) queryParams.append("status", status);
        if (employeeName) queryParams.append("employeeName", employeeName);
        if (employeeCode) queryParams.append("employeeCode", employeeCode);
        if (missionType) queryParams.append("missionType", missionType);
        if (paymentDateMin) queryParams.append("paymentDateMin", paymentDateMin);
        if (paymentDateMax) queryParams.append("paymentDateMax", paymentDateMax);
        
        queryParams.append("page", page.toString());
        queryParams.append("pageSize", pageSize.toString());

        const response = await api.get(`/api/ExpenseReport/by-filters?${queryParams}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: true, 
  });
};

export const useTotalNotReimbursed = () => {
  return useQuery<TotalNotReimbursedResponse, Error>({
    queryKey: EXPENSE_REPORT_KEY,
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