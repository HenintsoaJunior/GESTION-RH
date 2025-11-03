import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const SEARCH_MISSION_ASSIGNATIONS_BASE_KEY = ['searchMissionAssignations'] as const;
const MISSION_ASSIGNATION_BY_ID_BASE_KEY = ['getMissionAssignationByMissionId'] as const;
const MISSION_ASSIGNATION_BY_ASSIGNATION_ID_BASE_KEY = ['getMissionAssignationByAssignationId'] as const;

export interface MissionAssignationSearchFilters {
  employeeId?: string;
  matricule?: string[];
  missionId?: string;
  missionType?: string;
  transportId?: string;
  lieuId?: string;
  minDepartureDate?: string | null;
  maxDepartureDate?: string | null;
  minArrivalDate?: string | null;
  maxArrivalDate?: string | null;
  status?: string[];
}

interface Site {
  siteId: string;
  siteName: string;
  code: string;
  longitude: number | null;
  latitude: number | null;
  createdAt: string;
  updatedAt: string | null;
}

interface Direction {
  directionId: string;
  directionName: string;
  acronym: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Department {
  departmentId: string;
  departmentName: string;
  directionId: string;
  direction: Direction;
  createdAt: string;
  updatedAt: string | null;
}

interface Service {
  serviceId: string;
  serviceName: string;
  departmentId: string;
  department: Department;
  createdAt: string;
  updatedAt: string | null;
}

interface Gender {
  // Properties based on expected structure; adjust as per full schema if available
  genderId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

interface ContractType {
  // Properties based on expected structure; adjust as per full schema if available
  contractTypeId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Unit {
  // Properties based on expected structure; adjust as per full schema if available
  unitId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Employee {
  employeeId: string;
  employeeCode: string;
  lastName: string;
  firstName: string;
  phoneNumber: string;
  hireDate: string;
  jobTitle: string;
  contractEndDate: string;
  status: string;
  siteId: string;
  site: Site;
  genderId: string;
  gender: Gender | null;
  contractTypeId: string;
  contractType: ContractType | null;
  directionId: string;
  direction: Direction;
  departmentId: string;
  department: Department;
  serviceId: string;
  service: Service;
  unitId: string;
  unit: Unit | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface GeoZone {
  zoneId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Lieu {
  lieuId: string;
  nom: string;
  ville: string | null;
  codePostal: string | null;
  pays: string;
  zoneId: string | null;
  geoZone?: GeoZone;
  createdAt: string;
  updatedAt: string | null;
}

interface Mission {
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
  updatedAt: string | null;
}

interface Transport {
  transportId: string;
  type: string;
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
  isValidated: number | null; // Adjusted to match response (null possible)
  employee: Employee;
  mission: Mission;
  transport: Transport | null;
  type: string;
  allocatedFund: number;
  createdAt: string;
  updatedAt: string | null;
}

interface SearchData {
  data: MissionAssignation[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type SearchMissionAssignationsResponse = ApiResponse<SearchData>;

export interface GenerateMissionOrderData {
  missionId?: string;
  employeeId?: string;
}

export interface GenerateATDData {
  employeeId?: string;
}

export interface GenerateMissionOrderResult {
  fileName: string;
  status: string;
}

export interface MissionAssignationDTOForm {
  employeeId: string;
  transportId: string;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  type: string;
  allocatedFund: number;
  duration: number;
}

export interface MissionDTOForm {
  missionType: string;
  type: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  lieuId: string;
  userId: string;
  assignations: MissionAssignationDTOForm[];
}

export interface CreateMissionResponseData {
  id: string;
  mission: Mission;
}

export interface UpdateMissionResponseData {
  success: boolean;
  mission: Mission;
}

export const useSearchMissionAssignations = (
  filters: MissionAssignationSearchFilters,
  page: number = 1,
  pageSize: number = 10
) => {
  const queryKey = [...SEARCH_MISSION_ASSIGNATIONS_BASE_KEY, { filters, page, pageSize }] as const;

  return useQuery<SearchMissionAssignationsResponse, Error>({
    queryKey,
    queryFn: async () => {
      try {
        const response = await api.post('/api/MissionAssignation/search', filters, {
          params: { page, pageSize },
        });
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

export const useGetMissionAssignationByMissionId = (missionId: string) => {
  return useQuery<ApiResponse<MissionAssignation>, Error>({
    queryKey: [...MISSION_ASSIGNATION_BY_ID_BASE_KEY, missionId] as const,
    queryFn: async () => {
      try {
        const response = await api.get(`/api/Mission/${missionId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!missionId,
  });
};

export const useGetMissionAssignationByAssignationId = (assignationId: string) => {
  return useQuery<ApiResponse<MissionAssignation>, Error>({
    queryKey: [...MISSION_ASSIGNATION_BY_ASSIGNATION_ID_BASE_KEY, assignationId] as const,
    queryFn: async () => {
      try {
        const response = await api.get(`/api/MissionAssignation/${assignationId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!assignationId,
  });
};

export const useCreateMission = () => {
  return useMutation<ApiResponse<CreateMissionResponseData>, Error, MissionDTOForm>({
    mutationFn: async (data: MissionDTOForm) => {
      try {
        const response = await api.post('/api/Mission', data);
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

export const useUpdateMission = (missionId: string) => {
  return useMutation<ApiResponse<UpdateMissionResponseData>, Error, MissionDTOForm>({
    mutationFn: async (data: MissionDTOForm) => {
      if (!missionId || !data.userId) {
        throw new Error('Mission ID and userId are required for update');
      }
      const response = await api.put(`/api/Mission/${missionId}`, data);
      return response.data;
    },
  });
};

export const useGenerateMissionOrder = () => {
  return useMutation<GenerateMissionOrderResult, Error, GenerateMissionOrderData>({
    mutationFn: async (data: GenerateMissionOrderData) => {
      const url = "/api/MissionAssignation/OM";

      const config = {
        responseType: 'blob' as const,
        headers: {
          Accept: "application/pdf",
          "Content-Type": "application/json",
        },
      };

      const response = await api.post(url, {
        missionId: data.missionId || null,
        employeeId: data.employeeId || null,
      }, config);

      const blob = response.data;

      // Check if the blob is valid
      if (!blob || blob.size === 0) {
        throw new Error("Le fichier PDF généré est vide");
      }

      // Extract filename from content-disposition header or generate a default
      const contentDisposition = response.headers['content-disposition'];
      const extractFilename = (header?: string): string => {
        if (!header) {
          return `OrdreMission-${data.missionId || "document"}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
        }

        const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
          return decodeURIComponent(utf8Match[1]);
        }

        const standardMatch = header.match(/filename="([^"]+)"/i);
        if (standardMatch && standardMatch[1]) {
          return standardMatch[1];
        }

        return `OrdreMission-${data.missionId || "document"}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
      };

      const fileName = contentDisposition
        ? extractFilename(contentDisposition)
        : `OrdreMission-${data.missionId || "document"}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;

      // Create and trigger download
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      return { fileName, status: "success" };
    },
  });
};


export const useGenerateATD = () => {
  return useMutation<GenerateMissionOrderResult, Error, GenerateATDData>({
    mutationFn: async (data: GenerateATDData) => {
      const url = "/api/MissionAssignation/ATD";

      const config = {
        responseType: 'blob' as const,
        headers: {
          Accept: "application/pdf",
          "Content-Type": "application/json",
        },
      };

      const response = await api.post(url, {
        employeeId: data.employeeId || null,
      }, config);

      const blob = response.data;

      // Check if the blob is valid
      if (!blob || blob.size === 0) {
        throw new Error("Le fichier PDF généré est vide");
      }

      // Extract filename from content-disposition header or generate a default
      const contentDisposition = response.headers['content-disposition'];
      const extractFilename = (header?: string): string => {
        if (!header) {
          return `ATTESTATION EMPLOI-${data.employeeId || "document"}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
        }

        const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
          return decodeURIComponent(utf8Match[1]);
        }

        const standardMatch = header.match(/filename="([^"]+)"/i);
        if (standardMatch && standardMatch[1]) {
          return standardMatch[1];
        }

        return `ATTESTATION EMPLOI-${data.employeeId || "document"}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
      };

      const fileName = contentDisposition
        ? extractFilename(contentDisposition)
        : `ATTESTATION EMPLOI-${data.employeeId || "document"}-${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;

      // Create and trigger download
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlBlob;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      return { fileName, status: "success" };
    },
  });
};

export interface CancelMissionData {
  missionId: string;
  userId: string;
}

export const useCancelMission = () => {
  return useMutation<ApiResponse<null>, Error, CancelMissionData>({
    mutationFn: async (data: CancelMissionData) => {
      if (!data.missionId || !data.userId) {
        throw new Error('Mission ID and userId are required for cancellation');
      }
      const response = await api.put(`/api/Mission/${data.missionId}/cancel/${data.userId}`);
      return response.data;
    },
  });
};

export interface DeleteMissionData {
  missionId: string;
  userId: string;
}

export const useDeleteMission = () => {
  return useMutation<ApiResponse<null>, Error, DeleteMissionData>({
    mutationFn: async (data: DeleteMissionData) => {
      if (!data.missionId || !data.userId) {
        throw new Error('Mission ID and userId are required for deletion');
      }
      const response = await api.delete(`/api/Mission/${data.missionId}/${data.userId}`);
      return response.data;
    },
  });
};