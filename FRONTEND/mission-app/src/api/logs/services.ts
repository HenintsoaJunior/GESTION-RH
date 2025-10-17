import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

export const SEARCH_LOGS_BASE_KEY = ['searchLogs'] as const;

export interface LogSearchFilters {
  action?: string;
  tableName?: string;
  userId?: string;
  minCreatedAt?: string | null;
  maxCreatedAt?: string | null;
}

interface LogUser {
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
  userType: number | null;
  refreshToken: string;
  refreshTokenExpiry: string;
  userRoles: unknown[];
  userHabilitations: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface Log {
  logId: string;
  ipAddress: string;
  action: string;
  tableName: string;
  oldValues: string | null;
  newValues: string | null;
  userId: string;
  user: LogUser;
  createdAt: string;
  updatedAt: string | null;
}

export interface SearchLogsData {
  logs: Log[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type SearchLogsResponse = ApiResponse<SearchLogsData>;

export const useSearchLogs = (filters: LogSearchFilters, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...SEARCH_LOGS_BASE_KEY, { filters, page, pageSize }] as const;

  return useQuery<SearchLogsResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await api.post('/api/Log/search', filters, { params: { page, pageSize } });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!filters || page > 0,
  });
};