import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const UNITS_BASE_KEY = ['units'] as const;

export interface Unit {
  unitId: string;
  unitName: string;
  serviceId: string;
  service?: {
    serviceId: string;
    serviceName: string;
  };
  createdAt: string;
  updatedAt: string | null;
}

export interface UnitDTOForm {
  unitName: string;
  serviceId: string;
}

interface SearchData {
  data: Unit[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetUnitsResponse = SearchData;

type GetAllUnitsResponse = ApiResponse<Unit[]>;

export const useGetUnits = (name?: string, serviceId?: string, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...UNITS_BASE_KEY, { name, serviceId, page, pageSize }] as const;

  return useQuery<GetUnitsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Unit/search', {
        params: { name, serviceId, page, pageSize },
      });
      return response.data;
    },
  });
};

export const useGetAllUnits = () => {
  const queryKey = [...UNITS_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllUnitsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Unit');
      return response.data;
    },
  });
};

export const useCreateUnit = () => {
  return useMutation<ApiResponse<Unit>, Error, UnitDTOForm>({
    mutationFn: async (data: UnitDTOForm) => {
      const payload = {
        UnitName: data.unitName,
        ServiceId: data.serviceId,
      };
      const response = await api.post('/api/Unit', payload);
      return response.data;
    },
  });
};

export const useUpdateUnit = (unitId: string) => {
  return useMutation<ApiResponse<Unit>, Error, UnitDTOForm>({
    mutationFn: async (data: UnitDTOForm) => {
      const payload = {
        UnitId: unitId,
        UnitName: data.unitName,
        ServiceId: data.serviceId,
      };
      const response = await api.put(`/api/Unit/${unitId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteUnit = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (unitId: string) => {
      const response = await api.delete(`/api/Unit/${unitId}`);
      return response.data;
    },
  });
};