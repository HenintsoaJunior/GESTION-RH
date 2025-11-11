import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const EXPENSE_COMPENSATION_SCALES_KEY = ['expenseCompensationScales'] as const;
const EXPENSE_COMPENSATION_SCALE_BY_ID_KEY = ['expenseCompensationScale', 'byId'] as const;

export interface ExpenseCompensationScaleSearchFilters {
  amount?: number;
  isTransport?: number;
  devise?: string;
  expenseTypeId?: string;
  zoneId?: string;
}

interface ExpenseType {
  expenseTypeId: string;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Zone {
  zoneId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExpenseCompensationScale {
  expenseCompensationScaleId: string;
  amount: number;
  isTransport: number;
  devise: string;
  expenseTypeId?: string;
  expenseType?: ExpenseType;
  zoneId: string;
  zone?: Zone;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ExpenseCompensationScaleDTOForm {
  amount: number;
  isTransport: number;
  devise?: string;
  expenseTypeId?: string;
  zoneId: string;
  userId: string;
}

export interface BulkExpenseCompensationScaleDTO {
  amount: number;
  isTransport: number;
  devise?: string;
  expenseTypeId?: string;
  zoneId: string;
}

export interface BulkExpenseCompensationScaleSyncRequest {
  expenseCompensationScales: BulkExpenseCompensationScaleDTO[];
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetAllExpenseCompensationScalesResponse = ApiResponse<ExpenseCompensationScale[]>;
type GetExpenseCompensationScaleByIdResponse = ApiResponse<ExpenseCompensationScale>;
type SearchExpenseCompensationScalesResponse = ApiResponse<ExpenseCompensationScale[]>;

export interface CreateExpenseCompensationScaleResult {
  expenseCompensationScaleId: string;
  status: number;
  message: string;
}

export interface UpdateExpenseCompensationScaleResult {
  message: string;
  status: number;
}

export interface DeleteExpenseCompensationScaleResult {
  message: string;
  data: { id: string };
  status: number;
}

export interface BulkSyncExpenseCompensationScalesResult {
  createdIds: string[];
  message: string;
  status: number;
}

export const useGetAllExpenseCompensationScales = () => {
  return useQuery<GetAllExpenseCompensationScalesResponse, Error>({
    queryKey: EXPENSE_COMPENSATION_SCALES_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseCompensationScale');
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

export const useGetExpenseCompensationScaleById = (id: string | undefined) => {
  const queryKey = [...EXPENSE_COMPENSATION_SCALE_BY_ID_KEY, id] as const;

  return useQuery<GetExpenseCompensationScaleByIdResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!id) {
        throw new Error('ID is required for fetching expense compensation scale');
      }
      try {
        const response = await api.get(`/api/ExpenseCompensationScale/${id}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!id,
  });
};

export const useSearchExpenseCompensationScales = (criteria: ExpenseCompensationScaleSearchFilters | undefined) => {
  const queryKey = [...EXPENSE_COMPENSATION_SCALES_KEY, 'search', criteria] as const;

  return useQuery<SearchExpenseCompensationScalesResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!criteria) {
        throw new Error('Criteria are required for searching expense compensation scales');
      }
      try {
        const response = await api.post('/api/ExpenseCompensationScale/search', criteria);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!criteria,
  });
};

export const useCreateExpenseCompensationScale = () => {
  return useMutation<CreateExpenseCompensationScaleResult, Error, ExpenseCompensationScaleDTOForm>({
    mutationFn: async (dto: ExpenseCompensationScaleDTOForm) => {
      try {
        const response = await api.post('/api/ExpenseCompensationScale', dto);
        return {
          expenseCompensationScaleId: response.data.data?.CompensationScaleId || '',
          status: response.data.status,
          message: response.data.message,
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

export const useUpdateExpenseCompensationScale = () => {
  return useMutation<UpdateExpenseCompensationScaleResult, Error, { id: string; dto: ExpenseCompensationScaleDTOForm }>({
    mutationFn: async ({ id, dto }: { id: string; dto: ExpenseCompensationScaleDTOForm }) => {
      try {
        const response = await api.put(`/api/ExpenseCompensationScale/${id}`, dto);
        return {
          message: response.data.data?.message || 'Success',
          status: response.data.status,
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

export const useDeleteExpenseCompensationScale = () => {
  return useMutation<DeleteExpenseCompensationScaleResult, Error, { id: string; userId: string }>({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      try {
        const response = await api.delete(`/api/ExpenseCompensationScale/${id}?userId=${userId}`);
        return {
          message: response.data.data?.message || 'Success',
          data: response.data.data?.data || { id },
          status: response.data.status,
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};

export const useBulkSyncExpenseCompensationScales = () => {
  return useMutation<BulkSyncExpenseCompensationScalesResult, Error, BulkExpenseCompensationScaleSyncRequest>({
    mutationFn: async (request: BulkExpenseCompensationScaleSyncRequest) => {
      try {
        const response = await api.post('/api/ExpenseCompensationScale/bulk-sync', request);
        return {
          createdIds: response.data.data?.CreatedIds || [],
          message: response.data.data?.Message || 'Success',
          status: response.data.status,
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
  });
};