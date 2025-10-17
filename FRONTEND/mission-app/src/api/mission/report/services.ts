import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios-config';
import axios from 'axios';
// Query keys
const MISSION_REPORTS_BASE_KEY = ['missionReports'] as const;
const MISSION_REPORT_BY_ID_BASE_KEY = ['missionReport'] as const;

// Interfaces for nested objects
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
  userRoles: string[];
  userHabilitations: string[];
  createdAt: string;
  updatedAt: string;
}

interface MissionAssignation {
  assignationId: string;
  employeeId: string;
  missionId: string;
  transportId: string | null;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  duration: string | null;
  isValidated: boolean | null;
  employee: unknown | null;
  mission: unknown | null;
  transport: unknown | null;
  type: string;
  allocatedFund: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface MissionReport {
  missionReportId: string;
  text: string;
  userId: string;
  user: User;
  assignationId: string;
  missionAssignation: MissionAssignation;
  createdAt: string;
  updatedAt: string | null;
}

// Generic API response interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Specific response interfaces
interface MissionReportsResponseData {
  data: MissionReport[];
}

interface MissionReportResponseData {
  data: MissionReport;
}

interface CreateMissionReportResponseData {
  missionReportId: string;
}

interface UpdateMissionReportResponseData {
  message: string;
}

interface DeleteMissionReportResponseData {
  message: string;
  data: {
    id: string;
    userId: string;
  };
}

// Request interfaces
interface CreateMissionReportRequest {
  text: string;
  userId: string;
  assignationId: string;
}

interface UpdateMissionReportRequest {
  text: string;
  userId: string;
  assignationId: string;
}

// Hook for fetching all mission reports
export const useMissionReports = () => {
  return useQuery<ApiResponse<MissionReportsResponseData>, Error>({
    queryKey: MISSION_REPORTS_BASE_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/MissionReport');
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

// Hook for fetching a single mission report
export const useMissionReport = (missionReportId: string) => {
  return useQuery<ApiResponse<MissionReportResponseData>, Error>({
    queryKey: [...MISSION_REPORT_BY_ID_BASE_KEY, missionReportId],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/MissionReport/${missionReportId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!missionReportId,
  });
};

// Hook for creating a mission report
export const useCreateMissionReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<CreateMissionReportResponseData>, Error, CreateMissionReportRequest>({
    mutationFn: async (data) => {
      try {
        const response = await api.post('/api/MissionReport', data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MISSION_REPORTS_BASE_KEY });
    },
  });
};

// Hook for updating a mission report
export const useUpdateMissionReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<UpdateMissionReportResponseData>, Error, { id: string; data: UpdateMissionReportRequest }>({
    mutationFn: async ({ id, data }) => {
      if (!id) {
        throw new Error('Mission Report ID is required for update');
      }
      try {
        const response = await api.put(`/api/MissionReport/${id}`, data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MISSION_REPORTS_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: [...MISSION_REPORT_BY_ID_BASE_KEY, id] });
    },
  });
};

// Hook for deleting a mission report
export const useDeleteMissionReport = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<DeleteMissionReportResponseData>, Error, { id: string; userId: string }>({
    mutationFn: async ({ id, userId }) => {
      try {
        const response = await api.delete(`/api/MissionReport/${id}`, {
          params: { userId },
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MISSION_REPORTS_BASE_KEY });
      queryClient.invalidateQueries({ queryKey: [...MISSION_REPORT_BY_ID_BASE_KEY, id] });
    },
  });
};