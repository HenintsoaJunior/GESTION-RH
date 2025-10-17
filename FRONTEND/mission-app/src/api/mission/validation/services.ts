import { useQuery } from '@tanstack/react-query';
import { useCallback as useReactCallback } from 'react';
import axios from 'axios';
import api from '@/utils/axios-config';

const MISSION_VALIDATIONS_BY_ASSIGNATION_ID_KEY = ['missionValidationsByAssignationId'] as const;
const MISSION_VALIDATION_REQUESTS_KEY = ['missionValidationRequests'] as const;

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
  userType: number | null;
  refreshToken: string | null;
  refreshTokenExpiry: string | null;
  userRoles: any[];
  userHabilitations: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Lieu {
  lieuId: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  missionId: string;
  missionType: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  lieuId: string;
  lieu: Lieu;
  createdAt: string;
  updatedAt: string;
}

export interface MissionAssignation {
  assignationId: string;
  employeeId: string;
  missionId: string;
  transportId: string | null;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  duration: number;
  isValidated: number | null;
  employee: any | null;
  mission: Mission | null;
  transport: any | null;
  type: string;
  allocatedFund: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface MissionValidation {
  missionValidationId: string;
  status: string;
  validationDate: string | null;
  missionCreator: string;
  creator: User;
  missionId: string;
  mission: Mission;
  missionAssignationId: string;
  missionAssignation: MissionAssignation;
  toWhom: string;
  validator: User;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface RequestFilter {
  employeeId?: string;
  status?: string;
}

export interface MissionValidationRequestsResponse {
  results: MissionValidation[];
  totalCount: number;
}

export interface FormattedMission {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  department: string;
  status: string;
  requestDate: string;
  dueDate: string;
  estimatedDuration: string;
  location: string;
  comments: string;
  signature: string;
  matricule: string;
  function: string;
  transport: string;
  departureTime: string;
  departureDate: string;
  returnDate: string;
  returnTime: string;
  reference: string;
  toWhom: string;
  validationDate: string | null;
  missionCreator: string;
  superiorName: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  missionAssignationId: string;
  missionType: string;
  missionStatus: string;
  allocatedFund: number;
  type: string;
  assignationType: string;
  employeeId: string;
  missionId: string;
}

export interface MissionBudget {
  directionName: string;
  budget: number;
  userId: string;
}

export const useGetMissionValidationsByAssignationId = (assignationId: string | undefined) => {
  const queryKey = [...MISSION_VALIDATIONS_BY_ASSIGNATION_ID_KEY, assignationId] as const;

  return useQuery<MissionValidation[], Error>({
    queryKey,
    queryFn: async () => {
      if (!assignationId) {
        throw new Error('assignationId is required for fetching mission validations');
      }
      try {
        const response = await api.get(`/api/MissionValidation/by-assignation-id/${assignationId}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message || 'Failed to fetch mission validations');
        }
        return response.data.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'An error occurred while fetching mission validations');
        }
        throw error;
      }
    },
    enabled: !!assignationId, 
  });
};

export const useGetMissionValidationRequests = (
  userId: string | undefined,
  page: number = 1,
  pageSize: number = 10,
  filter?: RequestFilter
) => {
  const queryKey = [...MISSION_VALIDATION_REQUESTS_KEY, userId, page, pageSize, filter] as const;

  return useQuery<MissionValidationRequestsResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId is required for fetching mission validation requests');
      }
      if (page < 1 || pageSize < 1) {
        throw new Error('Pagination parameters must be greater than 0');
      }
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        if (filter?.employeeId) {
          params.append('employeeId', filter.employeeId);
        }
        if (filter?.status) {
          params.append('status', filter.status);
        }
        const response = await api.get(`/api/MissionValidation/requests/${userId}?${params.toString()}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message || 'Failed to fetch mission validation requests');
        }
        return response.data.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'An error occurred while fetching mission validation requests');
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
};

export const useValidateMission = (userId: string) => {
  return useReactCallback(async (
    missionValidationId: string, 
    missionAssignationId: string, 
    action: string, 
    type?: string, 
    comment = "", 
    missionBudget?: MissionBudget
  ) => {
    if (!missionValidationId || !missionAssignationId) {
      throw new Error("Mission Validation ID and Mission Assignation ID are required");
    }
    if (!userId) {
      throw new Error("User ID is required. Please ensure you are logged in.");
    }
    if (!["validate", "reject"].includes(action)) {
      throw new Error("Invalid action. Must be 'validate' or 'reject'");
    }

    try {
      const payload = {
        missionValidationId,
        missionAssignationId,
        userId,
        ...(action === "validate" && {
          type,
          missionBudget,
          validation: true,
          isSureToConfirm: true
        }),
        ...(action === "reject" && {
          comment
        })
      };

      const endpoint = action === "validate" ? "/api/MissionValidation/validate" : "/api/MissionValidation/reject";

      const response = await api.post(endpoint, payload);
      if (response.data.status !== 200) {
        throw new Error(response.data.message || `Failed to ${action} mission validation`);
      }
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }, [userId]);
};