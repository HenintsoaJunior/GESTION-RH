/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const VALIDATORS_BASE_KEY = ['validators'] as const;

// Types basés sur la structure JSON fournie
export interface User {
  userId: string;
  matricule: string;
  email: string;
  name: string;
  position: string;
  department: string;
  superiorId: string | null;
  superiorName: string | null;
  status: string | null;
  signature: string | null;
  userType: number | null;
  refreshToken: string | null;
  refreshTokenExpiry: string | null;
  userRoles: any[];
  userHabilitations: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Validator {
  validatorId: string;
  validatorType: string;
  userId: string;
  department: string;
  user: User;
  backupOrder: number;
  superiorId: string | null;
  superior: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface ValidatorForm {
  validatorType: string;
  userId: string;
  department: string;
  backupOrder: number;
  superiorId?: string | null;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetValidatorsResponse = Validator[];

// Hook pour récupérer tous les validateurs
export const useGetValidators = () => {
  const queryKey = [...VALIDATORS_BASE_KEY, 'all'] as const;

  return useQuery<GetValidatorsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Validator[]>>('/api/ValidatorsFlow');
      return response.data.data || [];
    },
  });
};

// Hook pour rechercher des validateurs avec filtres
export const useSearchValidators = (
  validatorType?: string,
  department?: string,
  userId?: string,
  backupOrder?: number
) => {
  const queryKey = [...VALIDATORS_BASE_KEY, 'search', { validatorType, department, userId, backupOrder }] as const;

  return useQuery<GetValidatorsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Validator[]>>('/api/ValidatorsFlow/search', {
        params: { validatorType, department, userId, backupOrder },
      });
      return response.data.data || [];
    },
  });
};

// Hook pour récupérer un validateur par son ID
export const useGetValidatorById = (validatorId: string) => {
  const queryKey = [...VALIDATORS_BASE_KEY, 'byId', validatorId] as const;

  return useQuery<Validator | null, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Validator>>(`/api/ValidatorsFlow/${validatorId}`);
      return response.data.data;
    },
    enabled: !!validatorId, // Ne s'exécute que si validatorId existe
  });
};

// Hook pour créer un nouveau validateur
export const useCreateValidator = () => {
  return useMutation<ApiResponse<Validator>, Error, ValidatorForm>({
    mutationFn: async (data: ValidatorForm) => {
      const payload = {
        validatorType: data.validatorType,
        userId: data.userId,
        department: data.department,
        backupOrder: data.backupOrder,
        superiorId: data.superiorId || null,
      };
      const response = await api.post<ApiResponse<Validator>>('/api/ValidatorsFlow', payload);
      return response.data;
    },
  });
};

// Hook pour mettre à jour un validateur
export const useUpdateValidator = (validatorId: string) => {
  return useMutation<ApiResponse<Validator>, Error, ValidatorForm>({
    mutationFn: async (data: ValidatorForm) => {
      const payload = {
        validatorId,
        validatorType: data.validatorType,
        userId: data.userId,
        department: data.department,
        backupOrder: data.backupOrder,
        superiorId: data.superiorId || null,
      };
      const response = await api.put<ApiResponse<Validator>>(`/api/ValidatorsFlow/${validatorId}`, payload);
      return response.data;
    },
  });
};

// Hook pour supprimer un validateur
export const useDeleteValidator = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (validatorId: string) => {
      const response = await api.delete<ApiResponse<null>>(`/api/ValidatorsFlow/${validatorId}`);
      return response.data;
    },
  });
};

// Hook pour récupérer les validateurs par type
export const useGetValidatorsByType = (validatorType: string) => {
  const queryKey = [...VALIDATORS_BASE_KEY, 'byType', validatorType] as const;

  return useQuery<GetValidatorsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Validator[]>>('/api/ValidatorsFlow/type', {
        params: { validatorType },
      });
      return response.data.data || [];
    },
    enabled: !!validatorType,
  });
};

// Hook pour récupérer les validateurs par département
export const useGetValidatorsByDepartment = (department: string) => {
  const queryKey = [...VALIDATORS_BASE_KEY, 'byDepartment', department] as const;

  return useQuery<GetValidatorsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Validator[]>>('/api/ValidatorsFlow/department', {
        params: { department },
      });
      return response.data.data || [];
    },
    enabled: !!department,
  });
};

// Hook pour récupérer les validateurs avec un ordre de backup spécifique
export const useGetValidatorsByBackupOrder = (backupOrder: number) => {
  const queryKey = [...VALIDATORS_BASE_KEY, 'byBackupOrder', backupOrder] as const;

  return useQuery<GetValidatorsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Validator[]>>('/api/ValidatorsFlow/backup-order', {
        params: { backupOrder },
      });
      return response.data.data || [];
    },
    enabled: backupOrder !== undefined,
  });
};

// Hook utilitaire pour récupérer les validateurs principaux (backupOrder = 0)
export const useGetPrimaryValidators = () => {
  return useGetValidatorsByBackupOrder(0);
};

// Hook utilitaire pour récupérer les validateurs de backup (backupOrder > 0)
export const useGetBackupValidators = () => {
  const queryKey = [...VALIDATORS_BASE_KEY, 'backups'] as const;

  return useQuery<GetValidatorsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Validator[]>>('/api/ValidatorsFlow/backup-order', {
        params: { backupOrder: 1 },
      });
      return response.data.data || [];
    },
  });
};