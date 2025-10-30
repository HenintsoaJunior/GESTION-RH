import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const CONTRACT_TYPES_BASE_KEY = ['contractTypes'] as const;

export interface ContractType {
  contractTypeId: string;
  code: string;
  label: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateContractTypeDTO {
  code: string;
  label: string;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetContractTypesResponse = ApiResponse<ContractType[]>;

type GetContractTypeResponse = ApiResponse<ContractType>;

export const useGetContractTypes = () => {
  const queryKey = [...CONTRACT_TYPES_BASE_KEY, 'getAll'] as const;

  return useQuery<GetContractTypesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/ContractType');
      return response.data;
    },
  });
};

export const useGetContractType = (contractTypeId: string) => {
  const queryKey = [...CONTRACT_TYPES_BASE_KEY, contractTypeId] as const;

  return useQuery<GetContractTypeResponse, Error>({
    queryKey,
    enabled: !!contractTypeId,
    queryFn: async () => {
      const response = await api.get(`/api/ContractType/${contractTypeId}`);
      return response.data;
    },
  });
};

export const useCreateContractType = () => {
  return useMutation<ApiResponse<ContractType>, Error, CreateContractTypeDTO>({
    mutationFn: async (data: CreateContractTypeDTO) => {
      const payload = {
        Code: data.code,
        Label: data.label,
      };
      const response = await api.post('/api/ContractType', payload);
      return response.data;
    },
  });
};

export const useUpdateContractType = (contractTypeId: string) => {
  return useMutation<ApiResponse<ContractType>, Error, CreateContractTypeDTO>({
    mutationFn: async (data: CreateContractTypeDTO) => {
      const payload = {
        ContractTypeId: contractTypeId,
        Code: data.code,
        Label: data.label,
      };
      const response = await api.put(`/api/ContractType/${contractTypeId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteContractType = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (contractTypeId: string) => {
      const response = await api.delete(`/api/ContractType/${contractTypeId}`);
      return response.data;
    },
  });
};