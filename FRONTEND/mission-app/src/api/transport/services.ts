import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const TRANSPORTS_KEY = ['transports'] as const;

export interface Transport {
  transportId: string;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TransportDTOForm {
  type: string;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type TransportsResponse = ApiResponse<Transport[]>;
type TransportResponse = ApiResponse<Transport>;
type MutationResponse = ApiResponse<{ message: string } | Transport>;

export const useTransports = () => {
  return useQuery<TransportsResponse, Error>({
    queryKey: TRANSPORTS_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Transport');
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

export const useTransport = (id: string) => {
  return useQuery<TransportResponse, Error>({
    queryKey: [...TRANSPORTS_KEY, id],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/Transport/${id}`);
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

export const useCreateTransport = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, TransportDTOForm>({
    mutationFn: async (transportData: TransportDTOForm) => {
      try {
        const response = await api.post('/api/Transport', transportData);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTS_KEY });
    }
  });
};

export const useUpdateTransport = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, { id: string; transport: Partial<Transport> }>({
    mutationFn: async ({ id, transport }) => {
      try {
        const response = await api.put(`/api/Transport/${id}`, transport);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...TRANSPORTS_KEY, id] });
    }
  });
};

export const useDeleteTransport = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, string>({
    mutationFn: async (id: string) => {
      try {
        const response = await api.delete(`/api/Transport/${id}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSPORTS_KEY });
    }
  });
};