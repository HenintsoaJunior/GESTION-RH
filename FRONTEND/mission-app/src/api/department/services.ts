import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';
import type { Direction } from '@/api/direction/services';

const DEPARTMENTS_BASE_KEY = ['departments'] as const;

export interface Department {
  departmentId: string;
  departmentName: string;
  directionId: string;
  direction: Direction;
  createdAt: string;
  updatedAt: string | null;
}

export interface DepartmentDTOForm {
  name: string;
  directionId: string;
}

interface SearchData {
  data: Department[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetDepartmentsResponse = SearchData;

type GetAllDepartmentsResponse = ApiResponse<Department[]>;

export const useGetDepartments = (name?: string, directionId?: string, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...DEPARTMENTS_BASE_KEY, { name, directionId, page, pageSize }] as const;

  return useQuery<GetDepartmentsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Department/search', {
        params: { name, directionId, page, pageSize },
      });
      return response.data;
    },
  });
};

export const useGetAllDepartments = () => {
  const queryKey = [...DEPARTMENTS_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllDepartmentsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Department');
      return response.data;
    },
  });
};

export const useCreateDepartment = () => {
  return useMutation<ApiResponse<Department>, Error, DepartmentDTOForm>({
    mutationFn: async (data: DepartmentDTOForm) => {
      const payload = {
        DepartmentName: data.name,
        DirectionId: data.directionId,
      };
      const response = await api.post('/api/Department', payload);
      return response.data;
    },
  });
};

export const useUpdateDepartment = (departmentId: string) => {
  return useMutation<ApiResponse<Department>, Error, DepartmentDTOForm>({
    mutationFn: async (data: DepartmentDTOForm) => {
      const payload = {
        DepartmentId: departmentId,
        DepartmentName: data.name,
        DirectionId: data.directionId,
      };
      const response = await api.put(`/api/Department/${departmentId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteDepartment = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (departmentId: string) => {
      const response = await api.delete(`/api/Department/${departmentId}`);
      return response.data;
    },
  });
};