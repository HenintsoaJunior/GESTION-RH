import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const COMPENSATIONS_BY_EMPLOYEE_AND_MISSION_KEY = ['compensationsByEmployeeAndMission'] as const;
const TOTAL_NOT_PAID_KEY = ['compensation', 'total-notpaid'] as const;
const COMPENSATIONS_BY_STATUS_KEY = ['compensationsByStatus'] as const;

export interface MissionSearchFilters {
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
  status?: string;
  departureDate?: string | null;
  departureArrive?: string | null;
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
  genderId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

interface ContractType {
  contractTypeId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Unit {
  unitId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Employee {
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

interface Lieu {
  lieuId: string;
  nom: string;
  ville?: string;
  codePostal?: string;
  pays: string;
  createdAt: string;
  updatedAt: string | null;
}

interface Transport {
  transportId: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  missionId: string;
  missionType: number;
  type: number;
  name: string;
  description: string;
  status: number;
  startDate: string;
  endDate: string;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  duration: number;
  isValidated: number;
  allocatedFund: number;
  employeeId: string;
  lieuId: string;
  transportId: string;
  lieu: Lieu;
  employee: Employee;
  transport: Transport;
  createdAt: string;
  updatedAt: string;
}

export interface Compensation {
  compensationId: string;
  transportAmount: number;
  breakfastAmount: number;
  lunchAmount: number;
  dinnerAmount: number;
  accommodationAmount: number;
  communicationAmount?: number;
  visaAmount?: number;
  medicalExpensesAmount?: number;
  taxesAmount?: number;
  totalAmount?: number;
  paymentDate: string;
  devise?: string;
  status: string;
  assignationId: string;
  employee: {
    employeeId: string;
    employeeCode: string;
    lastName: string;
    firstName: string;
    phoneNumber: string;
    jobTitle: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type CompensationsByEmployeeAndMissionResponse = ApiResponse<{
  mission: Mission;
  compensations: Compensation[];
}>;

export type CompensationsByStatusResponse = ApiResponse<{
  items: Array<{
    mission: Mission;
    compensations: Compensation[];
  }>;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

interface TotalNotPaid {
  totalNotPaidAmount: number;
}

type TotalNotPaidResponse = ApiResponse<TotalNotPaid>;

export interface GenerateMissionOrderData {
  missionId?: string;
  employeeId?: string;
}

export interface GenerateMissionOrderResult {
  fileName: string;
  status: string;
}

export interface ExportMissionResult {
  fileName: string;
  status: string;
}

type UpdateStatusResponse = ApiResponse<null>;

export const useCompensationsByEmployeeAndMission = (employeeId: string | undefined, missionId: string | undefined) => {
  const queryKey = [...COMPENSATIONS_BY_EMPLOYEE_AND_MISSION_KEY, employeeId, missionId] as const;

  return useQuery<CompensationsByEmployeeAndMissionResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (!employeeId || !missionId) {
        throw new Error('Employee ID and Mission ID are required for fetching compensations');
      }
      try {
        const response = await api.get(`/api/Compensation/by-employee/${employeeId}/mission/${missionId}`);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!employeeId && !!missionId,
  });
};

export const useTotalNotPaid = () => {
  return useQuery<TotalNotPaidResponse, Error>({
    queryKey: TOTAL_NOT_PAID_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Compensation/total-notpaid');
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

export const useExportMissionExcel = () => {
  return useMutation<ExportMissionResult, Error, MissionSearchFilters>({
    mutationFn: async (filters: MissionSearchFilters) => {
      const config = {
        responseType: 'blob' as const,
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          "Content-Type": "application/json",
        },
      };

      const response = await api.post('/api/Compensation/generate-excel', {
        missionId: filters.missionId ?? null,
        employeeId: filters.employeeId ?? null,
        transportId: filters.transportId ?? null,
        lieuId: filters.lieuId ?? null,
        departureDate: filters.departureDate ?? filters.minDepartureDate ?? null,
        departureArrive: filters.departureArrive ?? filters.maxArrivalDate ?? null,
        status: filters.status ?? null,
      }, config);

      const blob = response.data;

      // Check if the blob is valid
      if (!blob || blob.size === 0) {
        throw new Error("Le fichier Excel généré est vide");
      }

      // Extract filename from content-disposition header or generate a default
      const contentDisposition = response.headers['content-disposition'];
      const extractFilename = (header?: string): string => {
        if (!header) {
          return `Missions_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.xlsx`;
        }

        const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
          return decodeURIComponent(utf8Match[1]);
        }

        const standardMatch = header.match(/filename="([^"]+)"/i);
        if (standardMatch && standardMatch[1]) {
          return standardMatch[1];
        }

        return `Missions_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.xlsx`;
      };

      const fileName = contentDisposition
        ? extractFilename(contentDisposition)
        : `Missions_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.xlsx`;

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

export interface CompensationFilters {
  employeeId?: string;
  employeeMatricule?: string;
  status?: string;
  requestDateFrom?: string;
  requestDateTo?: string;
  validationDateFrom?: string;
  validationDateTo?: string;
  page?: number;
  pageSize?: number;
}

export const useCompensationsByStatus = (
  page: number = 1, 
  pageSize: number = 10,
  filters?: Omit<CompensationFilters, 'page' | 'pageSize'>
) => {
  const queryKey = [...COMPENSATIONS_BY_STATUS_KEY, page, pageSize, filters] as const;

  return useQuery<CompensationsByStatusResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (filters?.employeeId && filters.employeeId.trim() !== "") {
        params.append('employeeId', filters.employeeId);
      }

      if (filters?.employeeMatricule && filters.employeeMatricule.trim() !== "") {
        params.append('EmployeeMatricule', filters.employeeMatricule);
      }

      if (filters?.status && filters.status.trim() !== "") {
        params.append('status', filters.status);
      }

      if (filters?.requestDateFrom && filters.requestDateFrom.trim() !== "") {
        params.append('requestDateFrom', filters.requestDateFrom);
      }

      if (filters?.requestDateTo && filters.requestDateTo.trim() !== "") {
        params.append('requestDateTo', filters.requestDateTo);
      }

      if (filters?.validationDateFrom && filters.validationDateFrom.trim() !== "") {
        params.append('validationDateFrom', filters.validationDateFrom);
      }

      if (filters?.validationDateTo && filters.validationDateTo.trim() !== "") {
        params.append('validationDateTo', filters.validationDateTo);
      }

      const url = `/api/Compensation/by-status?${params.toString()}`;

      try {
        const response = await api.get(url);
        
        if (response.data?.data?.items) {
        } else {
          console.log('⚠️ Aucun item trouvé dans la réponse');
        }
        
        return response.data;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('📡 Détails de l\'erreur Axios:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url
          });
        }
        console.error('❌ useQuery a échoué');
        throw error;
      }
    },
    // Supprimez onError et onSuccess ici car ils ne sont pas supportés dans useQuery
  });
};

export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateStatusResponse, Error, { employeeId: string; missionId: string; status: string }>({
    mutationFn: async ({ employeeId, missionId, status }) => {
      if (!employeeId || !missionId || !status) {
        throw new Error('Employee ID, Mission ID, and Status are required');
      }
      try {
        const response = await api.put(
          `/api/Compensation/employee/${employeeId}/mission/${missionId}/status`, 
          { status }  
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const apiMessage = error.response.data?.message || 'Erreur inconnue';
          throw new Error(apiMessage);
        }
        throw new Error('Erreur réseau ou inconnue');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: COMPENSATIONS_BY_STATUS_KEY });
      queryClient.invalidateQueries({ queryKey: TOTAL_NOT_PAID_KEY });
      
      queryClient.invalidateQueries({ 
        queryKey: ['compensation', variables.employeeId, variables.missionId] 
      });
      
      queryClient.invalidateQueries({ queryKey: ['compensations'] });
      
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du statut:', error.message);
    },
  });
};