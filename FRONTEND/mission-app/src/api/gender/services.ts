import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const GENDERS_BASE_KEY = ['genders'] as const;

export interface Gender {
  genderId: string;
  code: string;
  label: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateGenderDTO {
  code: string;
  label: string;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetGendersResponse = ApiResponse<Gender[]>;

type GetGenderResponse = ApiResponse<Gender>;

export const useGetGenders = () => {
  const queryKey = [...GENDERS_BASE_KEY, 'getAll'] as const;

  return useQuery<GetGendersResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Gender');
      return response.data;
    },
  });
};

export const useGetGender = (genderId: string) => {
  const queryKey = [...GENDERS_BASE_KEY, genderId] as const;

  return useQuery<GetGenderResponse, Error>({
    queryKey,
    enabled: !!genderId,
    queryFn: async () => {
      const response = await api.get(`/api/Gender/${genderId}`);
      return response.data;
    },
  });
};

export const useCreateGender = () => {
  return useMutation<ApiResponse<Gender>, Error, CreateGenderDTO>({
    mutationFn: async (data: CreateGenderDTO) => {
      const payload = {
        Code: data.code,
        Label: data.label,
      };
      const response = await api.post('/api/Gender', payload);
      return response.data;
    },
  });
};

export const useUpdateGender = (genderId: string) => {
  return useMutation<ApiResponse<Gender>, Error, CreateGenderDTO>({
    mutationFn: async (data: CreateGenderDTO) => {
      const payload = {
        GenderId: genderId,
        Code: data.code,
        Label: data.label,
      };
      const response = await api.put(`/api/Gender/${genderId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteGender = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (genderId: string) => {
      const response = await api.delete(`/api/Gender/${genderId}`);
      return response.data;
    },
  });
};