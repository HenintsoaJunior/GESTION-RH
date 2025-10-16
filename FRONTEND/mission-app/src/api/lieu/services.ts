import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const LIEUX_KEY = ['lieux'] as const;

export interface Lieu {
  lieuId: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type LieuxResponse = ApiResponse<Lieu[]>;

export const useLieux = () => {
  return useQuery<LieuxResponse, Error>({
    queryKey: LIEUX_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Lieu');
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