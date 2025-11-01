import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const COMPENSATION_SCALES_KEY = ['compensationScales'] as const;

export interface Transport {
  transportId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseType {
  expenseTypeId: string;
  timeStart: string;
  timeEnd: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCategory {
  employeeCategoryId: string;
  code: string;
  label: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CompensationScale {
  compensationScaleId: string;
  amount: number;
  place: string;
  transportId?: string;
  expenseTypeId?: string;
  employeeCategoryId: string;
  transport?: Transport;
  expenseType?: ExpenseType;
  employeeCategory: EmployeeCategory;
  createdAt: string;
  updatedAt: string | null;
}

export interface CompensationScaleDTOForm {
  amount: number;
  place: string;
  transportId?: string;
  expenseTypeId?: string;
  employeeCategoryId: string;
}

export interface BulkCompensationScaleDTO {
  amount: number;
  place: string;
  transportId?: string;
  expenseTypeId?: string;
}

export interface BulkCompensationScaleSyncRequest {
  CategoryIds: string[];
  CompensationScales: BulkCompensationScaleDTO[];
}

export interface BulkCompensationScaleSyncWrapper {
  request: BulkCompensationScaleSyncRequest;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type CompensationScalesResponse = ApiResponse<CompensationScale[]>;
type CompensationScaleResponse = ApiResponse<CompensationScale>;
type MutationResponse = ApiResponse<{ message: string } | CompensationScale>;

export const useCompensationScales = () => {
  return useQuery<CompensationScalesResponse, Error>({
    queryKey: COMPENSATION_SCALES_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/CompensationScale');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    }
  });
};

export const useCompensationScale = (id: string) => {
  return useQuery<CompensationScaleResponse, Error>({
    queryKey: [...COMPENSATION_SCALES_KEY, id],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/CompensationScale/${id}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!id
  });
};

export const useCompensationScalesByCategory = (categoryId: string) => {
  return useQuery<CompensationScalesResponse, Error>({
    queryKey: [...COMPENSATION_SCALES_KEY, 'category', categoryId],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/CompensationScale/category/${categoryId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!categoryId
  });
};

export const useCompensationScalesByCriteria = (criteria: CompensationScaleDTOForm, enabled = true) => {
  return useQuery<CompensationScalesResponse, Error>({
    queryKey: [...COMPENSATION_SCALES_KEY, 'criteria', JSON.stringify(criteria)],
    queryFn: async () => {
      try {
        const response = await api.post('/api/CompensationScale/search', criteria);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: enabled && !!criteria
  });
};


export const useBulkCreateCompensationScales = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, BulkCompensationScaleSyncWrapper>({
    mutationFn: async (payload: BulkCompensationScaleSyncWrapper) => {
      try {
        console.log('Payload reçu par mutationFn:', payload);
        console.log('Payload.request envoyé à API:', payload.request);
        const response = await api.post('/api/CompensationScale/bulk-sync', payload.request);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPENSATION_SCALES_KEY });
    }
  });
};