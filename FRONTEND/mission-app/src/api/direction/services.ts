import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const DIRECTIONS_BASE_KEY = ['directions'] as const;

export interface Direction {
  directionId: string;
  directionName: string;
  acronym: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface DirectionDTOForm {
  name: string;
  acronym: string;
}

interface SearchData {
  data: Direction[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetDirectionsResponse = SearchData;

type GetAllDirectionsResponse = ApiResponse<Direction[]>;

export const useGetDirections = (name?: string, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...DIRECTIONS_BASE_KEY, { name, page, pageSize }] as const;

  return useQuery<GetDirectionsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Direction/search', {
        params: { name, page, pageSize },
      });
      return response.data;
    },
  });
};

export const useGetAllDirections = () => {
  const queryKey = [...DIRECTIONS_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllDirectionsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Direction');
      return response.data;
    },
  });
};

export const useCreateDirection = () => {
  return useMutation<ApiResponse<Direction>, Error, DirectionDTOForm>({
    mutationFn: async (data: DirectionDTOForm) => {
      const payload = {
        DirectionName: data.name,
        Acronym: data.acronym,
      };
      const response = await api.post('/api/Direction', payload);
      return response.data;
    },
  });
};

export const useUpdateDirection = (directionId: string) => {
  return useMutation<ApiResponse<Direction>, Error, DirectionDTOForm>({
    mutationFn: async (data: DirectionDTOForm) => {
      const payload = {
        DirectionId: directionId,
        DirectionName: data.name,
        Acronym: data.acronym,
      };
      const response = await api.put(`/api/Direction/${directionId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteDirection = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (directionId: string) => {
      const response = await api.delete(`/api/Direction/${directionId}`);
      return response.data;
    },
  });
};