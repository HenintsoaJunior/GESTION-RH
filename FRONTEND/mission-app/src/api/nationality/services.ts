import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const NATIONALITIES_BASE_KEY = ['nationalities'] as const;

export interface Nationality {
  nationalityId: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface NationalityDTOForm {
  code: string;
  name: string;
}

interface SearchData {
  data: Nationality[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetNationalitiesResponse = SearchData;

type GetAllNationalitiesResponse = ApiResponse<Nationality[]>;

export const useGetNationalities = (name?: string, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...NATIONALITIES_BASE_KEY, { name, page, pageSize }] as const;

  return useQuery<GetNationalitiesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Nationality/search', {
        params: { name, page, pageSize },
      });
      return response.data;
    },
  });
};

export const useGetAllNationalities = () => {
  const queryKey = [...NATIONALITIES_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllNationalitiesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Nationality');
      return response.data;
    },
  });
};

export const useCreateNationality = () => {
  return useMutation<ApiResponse<Nationality>, Error, NationalityDTOForm>({
    mutationFn: async (data: NationalityDTOForm) => {
      const payload = {
        Code: data.code,
        Name: data.name,
      };
      const response = await api.post('/api/Nationality', payload);
      return response.data;
    },
  });
};

export const useUpdateNationality = (nationalityId: string) => {
  return useMutation<ApiResponse<Nationality>, Error, NationalityDTOForm>({
    mutationFn: async (data: NationalityDTOForm) => {
      const payload = {
        NationalityId: nationalityId,
        Code: data.code,
        Name: data.name,
      };
      const response = await api.put(`/api/Nationality/${nationalityId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteNationality = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (nationalityId: string) => {
      const response = await api.delete(`/api/Nationality/${nationalityId}`);
      return response.data;
    },
  });
};