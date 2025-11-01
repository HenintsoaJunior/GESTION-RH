import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const EXPENSE_TYPES_KEY = ['expenseTypes'] as const;

export interface ExpenseType {
  expenseTypeId: string;
  type: string;
  timeStart?: string;
  timeEnd?: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ExpenseTypeDTOForm {
  type: string;
  timeStart?: string;
  timeEnd?: string;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type ExpenseTypesResponse = ApiResponse<ExpenseType[]>;
type ExpenseTypeResponse = ApiResponse<ExpenseType>;
type MutationResponse = ApiResponse<{ message: string } | ExpenseType>;

export const useExpenseTypes = () => {
  return useQuery<ExpenseTypesResponse, Error>({
    queryKey: EXPENSE_TYPES_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/ExpenseType');
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

export const useExpenseType = (id: string) => {
  return useQuery<ExpenseTypeResponse, Error>({
    queryKey: [...EXPENSE_TYPES_KEY, id],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/ExpenseType/${id}`);
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

export const useCreateExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, ExpenseTypeDTOForm>({
    mutationFn: async (expenseTypeData: ExpenseTypeDTOForm) => {
      try {
        const response = await api.post('/api/ExpenseType', expenseTypeData);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_TYPES_KEY });
    }
  });
};

export const useUpdateExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, { id: string; expenseType: Partial<ExpenseType> }>({
    mutationFn: async ({ id, expenseType }) => {
      try {
        const response = await api.put(`/api/ExpenseType/${id}`, expenseType);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_TYPES_KEY });
      queryClient.invalidateQueries({ queryKey: [...EXPENSE_TYPES_KEY, id] });
    }
  });
};

export const useDeleteExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, string>({
    mutationFn: async (id: string) => {
      try {
        const response = await api.delete(`/api/ExpenseType/${id}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_TYPES_KEY });
    }
  });
};