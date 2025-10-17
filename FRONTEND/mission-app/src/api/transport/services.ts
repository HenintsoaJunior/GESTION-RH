import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const TRANSPORTS_KEY = ['transports'] as const;

export interface Transport {
  transportId: string;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type TransportsResponse = ApiResponse<Transport[]>;

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
    },
  });
};