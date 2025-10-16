import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

const EMPLOYEES_KEY = ['employees'] as const;

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

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type EmployeesResponse = ApiResponse<Employee[]>;

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