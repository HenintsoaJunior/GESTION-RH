import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const EMPLOYEES_BASE_KEY = ['employees'] as const;
const EMPLOYEES_KEY = ['employees'] as const;
const EMPLOYEES_SIMPLE_KEY = ['employeesSimple'] as const;

interface Site {
  siteId: string;
  siteName: string;
  code: string;
  longitude: number | null;
  latitude: number | null;
  createdAt: string;
  updatedAt: string | null;
}

interface Gender {
  genderId: string;
  code: string;
  label: string;
  createdAt: string;
  updatedAt: string | null;
}

interface ContractType {
  contractTypeId: string;
  code: string;
  label: string;
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

interface Unit {
  unitId: string;
  unitName: string;
  serviceId: string;
  service: Service;
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
  contractEndDate: string | null;
  status: string;
  siteId: string;
  site: Site;
  genderId: string;
  gender: Gender;
  contractTypeId: string;
  contractType: ContractType;
  directionId: string;
  direction: Direction;
  departmentId: string;
  department: Department;
  serviceId: string;
  service: Service;
  unitId: string;
  unit: Unit;
  createdAt: string;
  updatedAt: string | null;
}

export interface EmployeeFormDTO {
  lastName: string;
  firstName?: string;
  employeeCode?: string;
  phoneNumber?: string;
  hireDate?: string;
  jobTitle?: string;
  contractEndDate?: string;
  siteId: string;
  genderId: string;
  contractTypeId?: string;
  directionId: string;
  departmentId?: string;
  serviceId?: string;
  unitId?: string;
}

export interface EmployeeSearchFiltersDTO {
  jobTitle?: string;
  lastName?: string;
  firstName?: string;
  directionId?: string;
  contractTypeId?: string;
  employeeCode?: string;
  siteId?: string;
  genderId?: string;
}

export interface EmployeeStats {
  total: number;
}

interface SearchData {
  data: Employee[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetEmployeesResponse = SearchData;
type EmployeesResponse = ApiResponse<Employee[]>;
type GetAllEmployeesResponse = ApiResponse<Employee[]>;

export const useEmployees = () => {
  return useQuery<EmployeesResponse, Error>({
    queryKey: EMPLOYEES_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Employee');
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

export const useGetEmployees = (
  filters: EmployeeSearchFiltersDTO,
  page: number = 1,
  pageSize: number = 10
) => {
  const queryKey = [...EMPLOYEES_BASE_KEY, { filters, page, pageSize }] as const;

  return useQuery<GetEmployeesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.post('/api/Employee/search', filters, {
        params: { page, pageSize },
      });
      return response.data;
    },
  });
};

export const useGetAllEmployees = () => {
  const queryKey = [...EMPLOYEES_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllEmployeesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Employee');
      return response.data;
    },
  });
};

export const useGetAllEmployeesSimple = () => {
  return useQuery<GetAllEmployeesResponse, Error>({
    queryKey: EMPLOYEES_SIMPLE_KEY,
    queryFn: async () => {
      try {
        const response = await api.get('/api/Employee/simple');
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

export const useGetEmployeesByMatriculesSimple = (matricules: string[]) => {
  const sortedMatricules = matricules.sort();
  const queryKey = [...EMPLOYEES_SIMPLE_KEY, 'byMatricules', sortedMatricules] as const;

  return useQuery<GetAllEmployeesResponse, Error>({
    queryKey,
    queryFn: async () => {
      if (matricules.length === 0) {
        return { data: [], status: 200, message: 'success' } as GetAllEmployeesResponse;
      }
      try {
        const response = await api.post('/api/Employee/simple', matricules);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: matricules.length > 0,
  });
};

export const useGetEmployee = (employeeId: string) => {
  const queryKey = [...EMPLOYEES_BASE_KEY, employeeId] as const;

  return useQuery<ApiResponse<Employee>, Error>({
    queryKey,
    enabled: !!employeeId,
    queryFn: async () => {
      const response = await api.get(`/api/Employee/${employeeId}`);
      return response.data;
    },
  });
};

export const useGetEmployeesByGender = (genderId: string) => {
  const queryKey = [...EMPLOYEES_BASE_KEY, 'byGender', genderId] as const;

  return useQuery<ApiResponse<Employee[]>, Error>({
    queryKey,
    enabled: !!genderId,
    queryFn: async () => {
      const response = await api.get(`/api/Employee/gender/${genderId}`);
      return response.data;
    },
  });
};

export const useGetEmployeeStats = () => {
  const queryKey = [...EMPLOYEES_BASE_KEY, 'stats'] as const;

  return useQuery<ApiResponse<EmployeeStats>, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Employee/stats');
      return response.data;
    },
  });
};

export const useCreateEmployee = () => {
  return useMutation<ApiResponse<Employee>, Error, EmployeeFormDTO>({
    mutationFn: async (data: EmployeeFormDTO) => {
      const payload = {
        LastName: data.lastName,
        FirstName: data.firstName,
        EmployeeCode: data.employeeCode,
        PhoneNumber: data.phoneNumber,
        HireDate: data.hireDate,
        JobTitle: data.jobTitle,
        ContractEndDate: data.contractEndDate,
        SiteId: data.siteId,
        GenderId: data.genderId,
        ContractTypeId: data.contractTypeId,
        DirectionId: data.directionId,
        DepartmentId: data.departmentId,
        ServiceId: data.serviceId,
        UnitId: data.unitId,
      };
      const response = await api.post('/api/Employee', payload);
      return response.data;
    },
  });
};

export const useUpdateEmployee = (employeeId: string) => {
  return useMutation<ApiResponse<Employee>, Error, EmployeeFormDTO>({
    mutationFn: async (data: EmployeeFormDTO) => {
      const payload = {
        LastName: data.lastName,
        FirstName: data.firstName,
        EmployeeCode: data.employeeCode,
        PhoneNumber: data.phoneNumber,
        HireDate: data.hireDate,
        JobTitle: data.jobTitle,
        ContractEndDate: data.contractEndDate,
        SiteId: data.siteId,
        GenderId: data.genderId,
        ContractTypeId: data.contractTypeId,
        DirectionId: data.directionId,
        DepartmentId: data.departmentId,
        ServiceId: data.serviceId,
        UnitId: data.unitId,
      };
      const response = await api.put(`/api/Employee/${employeeId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteEmployee = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (employeeId: string) => {
      const response = await api.delete(`/api/Employee/${employeeId}`);
      return response.data;
    },
  });
};