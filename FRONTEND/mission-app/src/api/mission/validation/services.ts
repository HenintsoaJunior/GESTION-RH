import { useQuery,useQueryClient } from '@tanstack/react-query';
import { useCallback as useReactCallback } from 'react';
import axios from 'axios';
import api from '@/utils/axios-config';

const MISSION_VALIDATIONS_BY_ASSIGNATION_ID_KEY = ['missionValidationsByAssignationId'] as const;
const MISSION_VALIDATION_REQUESTS_KEY = ['missionValidationRequests'] as const;
const HAS_ANY_VALIDATOR_VALIDATED_KEY = ['hasAnyValidatorValidated'] as const;
const HAS_VALIDATION_LINE_KEY = ['hasValidationLine'] as const;

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
  userRoles: unknown[];
  userHabilitations: unknown[];
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

export interface Direction {
  directionId: string;
  directionName: string;
  acronym: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Department {
  departmentId: string;
  departmentName: string;
  directionId: string;
  direction: Direction;
  createdAt: string;
  updatedAt: string | null;
}

export interface Service {
  serviceId: string;
  serviceName: string;
  departmentId: string;
  department: Department;
  createdAt: string;
  updatedAt: string | null;
}

export interface Employee {
  employeeId: string;
  employeeCode: string | null;
  lastName: string;
  firstName: string;
  phoneNumber: string | null;
  email: string | null;
  hireDate: string;
  jobTitle: string | null;
  contractEndDate: string | null;
  status: string | null;
  siteId: string;
  site: unknown | null;
  genderId: string;
  gender: unknown | null;
  contractTypeId: string;
  contractType: unknown | null;
  directionId: string;
  direction: Direction | null;
  departmentId: string | null;
  department: Department | null;
  serviceId: string | null;
  service: Service | null;
  unitId: string | null;
  unit: unknown | null;
  createdAt: string;
  updatedAt: string | null;
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
  employee: Employee | null;
  mission: Mission | null;
  transport: unknown | null;
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
  validationDateFrom?: string;
  validationDateTo?: string;
  requestDateFrom?: string;
  requestDateTo?: string;
}

export interface MissionValidationRequestsResponse {
  results: MissionValidation[];
  totalCount: number;
}

export interface FormattedMissionValidationRequestsResponse {
  results: FormattedMission[];
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
  missionName: string;
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
  employeeName: string;
  direction: string;
  service: string;
  employeeEmail: string;
  employeeFunction: string;
}

export interface MissionBudget {
  directionName: string;
  budget: number;
  userId: string;
}

const formatMissionValidationToFormattedMission = (validation: MissionValidation): FormattedMission => {
  const {
    missionValidationId,
    status: validationStatus,
    validationDate,
    missionCreator,
    creator,
    mission,
    missionAssignation,
    toWhom,
    type: validationType,
    createdAt,
    updatedAt,
  } = validation;

  const {
    name: missionName,
    description,
    missionType,
    status: missionStatus,
    endDate,
    lieu,
  } = mission;

  const {
    assignationId: missionAssignationId,
    employee,
    departureDate,
    departureTime,
    returnDate,
    returnTime,
    duration,
    allocatedFund,
    type: assignationType,
    employeeId: empId,
  } = missionAssignation;

  const {
    employeeCode,
    jobTitle,
    department,
    direction,
    service,
    firstName,
    lastName,
    email: empEmail,
  } = employee || {};

  const departmentName = department?.departmentName || '';
  const directionName = direction?.directionName || '';
  const serviceName = service?.serviceName || '';
  const employeeFullName = `${firstName || ''} ${lastName || ''}`.trim() || '';
  const employeeEmailValue = empEmail || '';
  const employeeFunctionValue = jobTitle || '';

  return {
    id: missionValidationId,
    title: missionName,
    description,
    requestedBy: creator.name,
    department: departmentName,
    status: validationStatus,
    requestDate: createdAt,
    dueDate: endDate,
    estimatedDuration: duration.toString(),
    location: lieu?.nom || '',
    comments: '',
    signature: creator.signature || '',
    matricule: employeeCode || '',
    function: employeeFunctionValue,
    transport: '',
    departureTime,
    departureDate,
    returnDate,
    returnTime,
    reference: mission.missionId,
    missionName: mission.name,
    toWhom,
    validationDate,
    missionCreator,
    superiorName: creator.superiorName,
    email: creator.email,
    createdAt,
    updatedAt,
    missionAssignationId,
    missionType,
    missionStatus,
    allocatedFund,
    type: validationType,
    assignationType,
    employeeId: empId || '',
    missionId: mission.missionId,
    employeeName: employeeFullName,
    direction: directionName,
    service: serviceName,
    employeeEmail: employeeEmailValue,
    employeeFunction: employeeFunctionValue,
  };
};

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

  return useQuery<FormattedMissionValidationRequestsResponse, Error>({
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
        if (filter?.validationDateFrom) {
          params.append('validationDateFrom', filter.validationDateFrom);
        }
        if (filter?.validationDateTo) {
          params.append('validationDateTo', filter.validationDateTo);
        }
        if (filter?.requestDateFrom) {
          params.append('requestDateFrom', filter.requestDateFrom);
        }
        if (filter?.requestDateTo) {
          params.append('requestDateTo', filter.requestDateTo);
        }
        const response = await api.get(`/api/MissionValidation/requests/${userId}?${params.toString()}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message || 'Failed to fetch mission validation requests');
        }
        const rawData = response.data.data;
        return {
          results: rawData.results.map(formatMissionValidationToFormattedMission),
          totalCount: rawData.totalCount,
        };
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
  const queryClient = useQueryClient();
  
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

    const endpoint: "/api/MissionValidation/validate" | "/api/MissionValidation/reject" = 
      action === "validate" ? "/api/MissionValidation/validate" : "/api/MissionValidation/reject";

    const response = await api.post(endpoint, payload);
    if (response.data.status !== 200) {
      throw new Error(response.data.message || `Failed to ${action} mission validation`);
    }

    queryClient.invalidateQueries({ queryKey: HAS_ANY_VALIDATOR_VALIDATED_KEY });
    
    return response.data.data;
  }, [userId, queryClient]);
};

export const useHasAnyValidatorValidated = (missionId: string | undefined) => {
  const queryKey = [...HAS_ANY_VALIDATOR_VALIDATED_KEY, missionId] as const;

  return useQuery<boolean, Error>({
    queryKey,
    queryFn: async () => {
      if (!missionId) {
        throw new Error('missionId is required for checking if any validator has validated');
      }
      try {
        const response = await api.get(`/api/MissionValidation/has-any-validator-validated/${missionId}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message || 'Failed to check if any validator has validated');
        }
        return response.data.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'An error occurred while checking if any validator has validated');
        }
        throw error;
      }
    },
    enabled: !!missionId,
  });
};

export const useHasValidationLine = (userId: string | undefined) => {
  const queryKey = [...HAS_VALIDATION_LINE_KEY, userId] as const;

  return useQuery<boolean, Error>({
    queryKey,
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId is required for checking if user has validation line');
      }
      try {
        const response = await api.get(`/api/MissionValidation/has-validation-line/${userId}`);
        if (response.data.status !== 200) {
          throw new Error(response.data.message || 'Failed to check if user has validation line');
        }
        return response.data.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw new Error(error.response.data.message || 'An error occurred while checking if user has validation line');
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
};