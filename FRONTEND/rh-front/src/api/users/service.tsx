import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from 'config/apiConfig';

const DEPARTMENTS_KEY = ['departments'] as const;
const USERS_KEY = ['users'] as const;
const SEARCH_USERS_BASE_KEY = ['searchUsers'] as const;

interface UserSearchFilters {
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

interface User {
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

interface DepartmentsResponse {
  status: string;
  data: string[];
}

interface UsersResponse {
  status: string;
  data: User[];
}

interface SearchUsersData {
  Users: User[];
  TotalCount: number;
}

interface SearchUsersResponse {
  status: string;
  data: SearchUsersData;
}

export const useDepartments = () => {
  return useQuery<DepartmentsResponse, Error>({
    queryKey: DEPARTMENTS_KEY,
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/User/departments`, {
        headers: {
          accept: '*/*',
        },
      });
      return response.data;
    },
  });
};

export const useUsers = () => {
  return useQuery<UsersResponse, Error>({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/User`, {
        headers: {
          accept: '*/*',
        },
      });
      return response.data;
    },
  });
};

export const useSearchUsers = (filters: UserSearchFilters, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...SEARCH_USERS_BASE_KEY, { filters, page, pageSize }] as const;

  return useQuery<SearchUsersResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = { ...filters, page, pageSize };
      const response = await axios.post(`${BASE_URL}/api/User/search`, '', {
        params,
        headers: {
          accept: '*/*',
        },
      });
      return response.data;
    },
  });
};