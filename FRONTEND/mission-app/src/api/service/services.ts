import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';
import type { Department } from '@/api/department/services';

const SERVICES_BASE_KEY = ['services'] as const;

export interface Service {
  serviceId: string;
  serviceName: string;
  departmentId: string;
  department: Department;
  createdAt: string;
  updatedAt: string | null;
}

export interface ServiceDTOForm {
  name: string;
  departmentId: string;
}

interface SearchData {
  data: Service[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetServicesResponse = SearchData;

type GetAllServicesResponse = ApiResponse<Service[]>;

export const useGetServices = (name?: string, departmentId?: string, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...SERVICES_BASE_KEY, { name, departmentId, page, pageSize }] as const;

  return useQuery<GetServicesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Service/search', {
        params: { name, departmentId, page, pageSize },
      });
      return response.data;
    },
  });
};

export const useGetAllServices = () => {
  const queryKey = [...SERVICES_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllServicesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Service');
      return response.data;
    },
  });
};

export const useCreateService = () => {
  return useMutation<ApiResponse<Service>, Error, ServiceDTOForm>({
    mutationFn: async (data: ServiceDTOForm) => {
      const payload = {
        ServiceName: data.name,
        DepartmentId: data.departmentId,
      };
      const response = await api.post('/api/Service', payload);
      return response.data;
    },
  });
};

export const useUpdateService = (serviceId: string) => {
  return useMutation<ApiResponse<Service>, Error, ServiceDTOForm>({
    mutationFn: async (data: ServiceDTOForm) => {
      const payload = {
        ServiceId: serviceId,
        ServiceName: data.name,
        DepartmentId: data.departmentId,
      };
      const response = await api.put(`/api/Service/${serviceId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteService = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (serviceId: string) => {
      const response = await api.delete(`/api/Service/${serviceId}`);
      return response.data;
    },
  });
};