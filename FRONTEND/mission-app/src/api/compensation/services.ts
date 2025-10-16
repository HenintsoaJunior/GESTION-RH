import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const COMPENSATIONS_BY_EMPLOYEE_AND_MISSION_KEY = ['compensationsByEmployeeAndMission'] as const;

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
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  createdAt: string;
  updatedAt: string;
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
  transportId: string;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  duration: number;
  isValidated: boolean | null;
  employee: Employee;
  mission: Mission;
  transport: Transport;
  type: string;
  allocatedFund: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface Compensation {
  compensationId: string;
  transportAmount: number;
  breakfastAmount: number;
  lunchAmount: number;
  dinnerAmount: number;
  accommodationAmount: number;
  totalAmount: number;
  paymentDate: string;
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
  };
  createdAt: string;
  updatedAt: string | null;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type CompensationsByEmployeeAndMissionResponse = ApiResponse<{
  assignation: MissionAssignation;
  compensations: Compensation[];
}>;

export interface GenerateMissionOrderData {
  missionId?: string;
  employeeId?: string;
}

export interface GenerateMissionOrderResult {
  fileName: string;
  status: string;
}

export interface ExportMissionAssignationResult {
  fileName: string;
  status: string;
}

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

export const useExportMissionAssignationExcel = () => {
  return useMutation<ExportMissionAssignationResult, Error, MissionAssignationSearchFilters>({
    mutationFn: async (filters: MissionAssignationSearchFilters) => {
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
          return `Mission_Assignations_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.xlsx`;
        }

        const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
        if (utf8Match && utf8Match[1]) {
          return decodeURIComponent(utf8Match[1]);
        }

        const standardMatch = header.match(/filename="([^"]+)"/i);
        if (standardMatch && standardMatch[1]) {
          return standardMatch[1];
        }

        return `Mission_Assignations_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.xlsx`;
      };

      const fileName = contentDisposition
        ? extractFilename(contentDisposition)
        : `Mission_Assignations_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.xlsx`;

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