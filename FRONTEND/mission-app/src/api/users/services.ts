import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import axios from 'axios';
import api from '@/utils/axios-config';
import { MENU_HIERARCHY_KEY } from '@/api/menu/services';
import { SEARCH_LOGS_BASE_KEY } from '@/api/logs/services';

const DEPARTMENTS_KEY = ['departments'] as const;
export const USERS_KEY = ['users'] as const;
export const SEARCH_USERS_BASE_KEY = ['searchUsers'] as const;
export const USER_ROLES_BASE_KEY = ['userRoles'] as const;
export const USER_HABILITATIONS_BASE_KEY = ['userHabilitations'] as const;
export const USER_INFOS_BASE_KEY = ['userInfos'] as const;
export const USER_COLLABORATORS_BASE_KEY = ['userCollaborators'] as const;
const USER_HABILITATION_BULK_BASE_KEY = ['userHabilitationBulk'] as const;
export const BULK_REMOVE_USER_ROLES_KEY = ['bulkRemoveUserRoles'] as const;
export const USER_HABILITATIONSROLE_KEY = ['userHabilitationsRole'] as const;

export interface UserSearchFilters {
  name?: string;
  department?: string;
  role?: string;
}

interface Role {
  roleId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string | null;
}

interface UserRole {
  userId: string;
  roleId: string;
  role: Role;
  createdAt: string;
  updatedAt: string | null;
}

export interface User {
  userId: string;
  matricule: string;
  email: string;
  name: string;
  position: string;
  department: string;
  superiorId: string;
  superiorName: string;
  status: string | null;
  signature: string | null;
  userType: number;
  refreshToken: string;
  refreshTokenExpiry: string;
  userRoles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface UserInfo {
  userId: string;
  name: string;
  email: string;
  matricule: string;
  department: string;
  position: string;
  superiorId: string;
  superiorName: string;
  roles: any[];
}

export interface BulkHabilitationData {
  habilitationIds: string[];
  roleIds: string[];
  userId: string;
}

export interface UseUserHabilitationBulkParams {
  habilitationIds: string[];
  roleIds: string[];
  userId: string;
}

interface Habilitation {
  habilitationId: string;
  groupId: string;
  label: string;
  group: any | null;
  roleHabilitations: any[];
  createdAt: string;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type DepartmentsResponse = ApiResponse<string[]>;
type UsersResponse = ApiResponse<User[]>;
type SearchUsersData = {
  users: User[];
  totalCount: number;
};
type SearchUsersResponse = ApiResponse<SearchUsersData>;
type RolesResponse = ApiResponse<string[]>;
type HabilitationResponse = ApiResponse<Habilitation[]>;
type UserInfosResponse = ApiResponse<UserInfo[]>;
type BulkHabilitationResponse = ApiResponse<BulkHabilitationData>;

export interface UserRoleBulkDto {
  userIds: string[];
  roleIds: string[];
  userIdLog: string;
}

type BulkCreateUserRolesResponse = ApiResponse<UserRoleBulkDto>;
type BulkRemoveUserRolesResponse = ApiResponse<UserRoleBulkDto>;

export const useDepartments = () => {
  return useQuery<DepartmentsResponse, Error>({
    queryKey: DEPARTMENTS_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/User/departments'); 
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

export const useUsers = () => {
  return useQuery<UsersResponse, Error>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/User');
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

export const useSearchUsers = (filters: UserSearchFilters, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...SEARCH_USERS_BASE_KEY, { filters, page, pageSize }] as const;

  return useQuery<SearchUsersResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const params = { ...filters, page, pageSize };
        const response = await api.post('/api/User/search', {}, { params }); 
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

export const useUserHabilitations = (userId: string | undefined) => {
  const queryKey = [...USER_HABILITATIONS_BASE_KEY, userId] as const;

  return useQuery<HabilitationResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId is required for fetching habilitations');
      }
      try {
        const response = await api.get(`/api/User/${userId}/access-habilitations`);
        console.log("RESPONSE VALUE ",response.data)
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!userId, // N'exécute la requête que si userId est défini
  });
};

export const useUserHabilitationsRole = (userId?: string) => {
  return useQuery<HabilitationResponse, Error>({
    queryKey: [...USER_HABILITATIONSROLE_KEY, userId],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/User/${userId}/habilitations`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
};

export const useHasHabilitation = (userId: string | undefined, label: string) => {
  const { data: habilitationsResponse, isLoading } = useUserHabilitationsRole(userId);

  return useMemo(() => {
    if (isLoading) return undefined;
    
    if (!habilitationsResponse?.data) return false;
  
   return habilitationsResponse.data.some((h: Habilitation) => h.label === label);
  }, [habilitationsResponse, label, isLoading]);
};

export const useUserRoles = (userId: string | undefined) => {
  const queryKey = [...USER_ROLES_BASE_KEY, userId] as const;

  return useQuery<RolesResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId is required for fetching roles');
      }
      try {
        const response = await api.get(`/api/User/${userId}/roles`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!userId, // N'exécute la requête que si userId est défini
  });
};

export const useUserCollaborators = (userId: string | undefined) => {
  const queryKey = [...USER_COLLABORATORS_BASE_KEY, userId] as const;

  return useQuery<UserInfosResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId is required for fetching collaborators');
      }
      try {
        const response = await api.get(`/api/User/${userId}/collaborators`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
};

export const useBulkCreateUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkCreateUserRolesResponse, Error, UserRoleBulkDto>({
    mutationKey: ['bulkCreateUserRoles'],
    mutationFn: async (dto: UserRoleBulkDto) => {
      try {
        const response = await api.post('/api/UserRole/bulk', dto);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      // Invalider les queries spécifiques pour de meilleures performances
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.refetchQueries({ queryKey: SEARCH_LOGS_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: MENU_HIERARCHY_KEY });
      variables.userIds.forEach((userId) => {
        queryClient.invalidateQueries({ queryKey: [...USER_ROLES_BASE_KEY, userId] });
      });
    },
  });
};

export const useBulkRemoveUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation<BulkRemoveUserRolesResponse, Error, UserRoleBulkDto>({
    mutationKey: BULK_REMOVE_USER_ROLES_KEY,
    mutationFn: async (dto: UserRoleBulkDto) => {
      try {
        const response = await api.post('/api/UserRole/bulk/remove', dto);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      queryClient.refetchQueries({ queryKey: SEARCH_LOGS_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: MENU_HIERARCHY_KEY });
      variables.userIds.forEach((userId) => {
        queryClient.invalidateQueries({ queryKey: [...USER_ROLES_BASE_KEY, userId] });
      });
    },
  });
};

export const useUserInfos = (userIds: string[]) => {
  const queryKey = [...USER_INFOS_BASE_KEY, userIds.sort()] as const; 
  
  return useQuery<UserInfosResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await api.post('/api/User/infos', userIds);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: userIds.length > 0, // N'exécute que si la liste n'est pas vide
  });
};

export const useUserInfo = (userId: string | undefined) => {
  const queryKey = [...USER_INFOS_BASE_KEY, userId] as const;

  return useQuery<UserInfosResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId is required for fetching user info');
      }
      try {
        const response = await api.get(`/api/User/${userId}/info`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
};

export const useUserHabilitationBulk = () => {
  const queryClient = useQueryClient();

  return useMutation<BulkHabilitationResponse, Error, UseUserHabilitationBulkParams>({
    mutationKey: USER_HABILITATION_BULK_BASE_KEY,
    mutationFn: async ({ habilitationIds, roleIds, userId }: UseUserHabilitationBulkParams) => {
      if (!userId) {
        throw new Error('userId is required for bulk habilitation');
      }
      try {
        const response = await api.post('/api/UserHabilitation/bulk', {
          habilitationIds,
          roleIds,
          userId,
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({ queryKey: USERS_KEY });
      queryClient.refetchQueries({ queryKey: SEARCH_LOGS_BASE_KEY });
      queryClient.refetchQueries({ queryKey: [...USER_ROLES_BASE_KEY, variables.userId] });
      queryClient.refetchQueries({ queryKey: [...USER_HABILITATIONS_BASE_KEY, variables.userId] });
    },  
  });
};