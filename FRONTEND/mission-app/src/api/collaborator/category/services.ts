import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const COLLABORATOR_CATEGORIES_BASE_KEY = ['collaboratorCategories'] as const;

export interface CollaboratorCategory {
  employeeCategoryId: string;
  code: string;
  label: string;
  echelleCompensation?: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CollaboratorCategoryDTOForm {
  code: string;
  label: string;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetAllCollaboratorCategoriesResponse = ApiResponse<CollaboratorCategory[]>;
type GetCollaboratorCategoryResponse = ApiResponse<CollaboratorCategory>;
type MutationResponse = ApiResponse<CollaboratorCategory | { message: string }>;

export const useGetAllCollaboratorCategories = () => {
  return useQuery<GetAllCollaboratorCategoriesResponse, Error>({
    queryKey: [...COLLABORATOR_CATEGORIES_BASE_KEY, 'getAll'],
    queryFn: async () => {
      const response = await api.get('/api/EmployeeCategory');
      return response.data;
    },
  });
};

export const useGetCollaboratorCategory = (id: string) => {
  return useQuery<GetCollaboratorCategoryResponse, Error>({
    queryKey: [...COLLABORATOR_CATEGORIES_BASE_KEY, id],
    queryFn: async () => {
      const response = await api.get(`/api/EmployeeCategory/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCollaboratorCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, CollaboratorCategoryDTOForm>({
    mutationFn: async (data: CollaboratorCategoryDTOForm) => {
      const payload = {
        Code: data.code,
        Label: data.label,
      };
      const response = await api.post('/api/EmployeeCategory', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COLLABORATOR_CATEGORIES_BASE_KEY, 'getAll'] });
    },
  });
};

export const useUpdateCollaboratorCategory = (employeeCategoryId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, CollaboratorCategoryDTOForm>({
    mutationFn: async (data: CollaboratorCategoryDTOForm) => {
      const payload = {
        EmployeeCategoryId: employeeCategoryId,
        Code: data.code,
        Label: data.label,
      };
      const response = await api.put(`/api/EmployeeCategory/${employeeCategoryId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COLLABORATOR_CATEGORIES_BASE_KEY, 'getAll'] });
      queryClient.invalidateQueries({ queryKey: [...COLLABORATOR_CATEGORIES_BASE_KEY, employeeCategoryId] });
    },
  });
};

export const useDeleteCollaboratorCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<MutationResponse, Error, string>({
    mutationFn: async (employeeCategoryId: string) => {
      const response = await api.delete(`/api/EmployeeCategory/${employeeCategoryId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COLLABORATOR_CATEGORIES_BASE_KEY, 'getAll'] });
    },
  });
};