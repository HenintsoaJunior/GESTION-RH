import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';
import { SEARCH_LOGS_BASE_KEY } from '@/api/logs/services';
import { USER_INFOS_BASE_KEY } from '../users/services';

const ROLES_KEY = ['roles'] as const;
const ROLES_INFO_KEY = ['rolesInfo'] as const;
export const SEARCH_ROLES_BASE_KEY = ['searchRoles'] as const;
export const HABILITATIONS_KEY = ['habilitations'] as const;
const HABILITATIONS_GROUPS_KEY = ['habilitationsGroups'] as const;
export const HABILITATIONS_BY_ROLES_KEY = ['habilitationsByRoles'] as const;

export interface RoleSearchFilters {
  name?: string;
  description?: string;
}

export interface UserSearchFilters {
  name?: string;
  department?: string;
  role?: string;
}

interface UserRole {
  userId: string;
  roleId: string;
  role: Role;
  createdAt: string;
  updatedAt: string | null;
}

interface RoleHabilitation {
  habilitationId: string;
  roleId: string;
  habilitation: Habilitation | null;
  role: Role | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Role {
  roleId: string;
  name: string;
  description: string;
  userRoles: UserRole[];
  roleHabilitations: RoleHabilitation[];
  createdAt: string;
  updatedAt: string | null;
}

interface Habilitation {
  habilitationId: string;
  groupId: string;
  label: string;
  group: null;
  roleHabilitations: any[];
  createdAt: string;
  updatedAt: string | null;
}

// Nouvelles interfaces pour les rôles avec habilitations groupées
export interface HabilitationDto {
  habilitationId: string;
  label: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface HabilitationGroupDto {
  groupId: string;
  label: string;
  habilitations: HabilitationDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface RoleWithGroupedHabilitations {
  roleId: string;
  name: string;
  description: string;
  userRoles: any[];
  habilitationGroups: HabilitationGroupDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface HabilitationGroup {
  groupId: string;
  label: string;
  habilitations: Habilitation[];
  createdAt: string;
  updatedAt: string | null;
}

export interface RoleIdsRequest {
  roleIds: string[];
}

// Interface pour la requête bulk RoleHabilitation
export interface BulkRoleHabilitationRequest {
  userIdLog: string;
  habilitationIds: string[];
  roleIds: string[];
}

// Interface pour la réponse bulk RoleHabilitation
export interface BulkRoleHabilitationResponseData {
  habilitationIds: string[];
  roleIds: string[];
}

// Interface pour la requête de création de rôle avec habilitations
export interface CreateRoleWithHabilitationsRequest {
  userIdLog: string;
  name: string;
  description: string;
  habilitationIds: string[];
}

// Interface pour la réponse de création de rôle
export interface CreateRoleWithHabilitationsResponseData {
  role: Role;
}

// Interface pour la mise à jour d'un rôle
export interface UpdateRoleRequest {
  name: string;
  description: string;
}

// Interface pour la suppression d'un rôle
export interface DeleteRoleRequest {
  userId: string;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type RolesResponse = ApiResponse<Role[]>;
type RolesInfoResponse = ApiResponse<RoleWithGroupedHabilitations[]>;
type HabilitationsResponse = ApiResponse<Habilitation[]>;
type HabilitationsGroupsResponse = ApiResponse<HabilitationGroup[]>;
type HabilitationsByRolesResponse = ApiResponse<string[]>;
type BulkRoleHabilitationResponse = ApiResponse<BulkRoleHabilitationResponseData>;
type CreateRoleWithHabilitationsResponse = ApiResponse<CreateRoleWithHabilitationsResponseData>;
type UpdateRoleResponse = ApiResponse<Role>;
type DeleteRoleResponse = ApiResponse<null>;

export const useRoles = () => {
  return useQuery<RolesResponse, Error>({
    queryKey: ROLES_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Access/role');
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

export const useRolesInfo = () => {
  return useQuery<RolesInfoResponse, Error>({
    queryKey: ROLES_INFO_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Access/role-info');
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

export const useHabilitations = () => {
  return useQuery<HabilitationsResponse, Error>({
    queryKey: HABILITATIONS_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Access/habilitations');
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

export const useHabilitationsGroups = () => {
  return useQuery<HabilitationsGroupsResponse, Error>({
    queryKey: HABILITATIONS_GROUPS_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Access/habilitations-group');
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

export const useHabilitationsByRoles = (roleIds: string[]) => {
  return useQuery<HabilitationsByRolesResponse, Error>({
    queryKey: [...HABILITATIONS_BY_ROLES_KEY, roleIds],
    queryFn: async () => {
      try {
        const response = await api.post('/api/Access/habilitations-by-roles', { roleIds });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!roleIds?.length,
  });
};

export const useBulkRoleHabilitation = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkRoleHabilitationResponse, Error, BulkRoleHabilitationRequest>({
    mutationFn: async (request: BulkRoleHabilitationRequest) => {
      try {
        const response = await api.post('/api/RoleHabilitation/bulk', request);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_INFO_KEY });
      queryClient.invalidateQueries({ queryKey: HABILITATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: HABILITATIONS_GROUPS_KEY });
      queryClient.invalidateQueries({ queryKey: HABILITATIONS_BY_ROLES_KEY });
    },
  });
};

export const useCreateRoleWithHabilitations = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateRoleWithHabilitationsResponse, Error, CreateRoleWithHabilitationsRequest>({
    mutationFn: async (request: CreateRoleWithHabilitationsRequest) => {
      try {
        const response = await api.post('/api/RoleHabilitation/create-role', request);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_INFO_KEY });
      queryClient.invalidateQueries({ queryKey: HABILITATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: HABILITATIONS_GROUPS_KEY });
      queryClient.invalidateQueries({ queryKey: HABILITATIONS_BY_ROLES_KEY });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateRoleResponse, Error, { id: string; request: UpdateRoleRequest }>({
    mutationFn: async ({ id, request }) => {
      try {
        const response = await api.put(`/api/Role/${id}`, request);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_INFOS_BASE_KEY });
      queryClient.refetchQueries({ queryKey: SEARCH_LOGS_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_INFO_KEY });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteRoleResponse, Error, { id: string; userId: string }>({
    mutationFn: async ({ id, userId }) => {
      try {
        const response = await api.delete(`/api/Role/${id}`, { data: { userId } });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_INFOS_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_INFO_KEY });
      queryClient.refetchQueries({ queryKey: SEARCH_LOGS_BASE_KEY });
    },
  });
};