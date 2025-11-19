import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { BASE_URL } from '@/config/api-config';

export const IMPORT_KEY = ['import'] as const;

interface ImportFilesParams {
  employeeFile: File;
}

interface ImportResponseData {
  fileName: string;
  totalRows: number;
  employees: Array<{
    rowNumber: number;
    data: Record<string, string>;
  }>;
}

interface ImportResponse {
  data: ImportResponseData;
  status: number;
  message: string;
}

interface ResetResponse {
  data: {
    message: string;
  };
  status: number;
  message: string;
}

interface ApiErrorResponse {
  status: number;
  message: string;
  data: null;
}

export const useImport = () => {
  const importMutation = useMutation<ImportResponse, Error, ImportFilesParams>({
    mutationKey: [...IMPORT_KEY, 'import'],
    mutationFn: async (params) => {
      console.log('Import mutation started with params:', params);
      
      if (!params.employeeFile) {
        const errorMsg = 'Employee file must be provided';
        console.error('Import validation failed:', errorMsg);
        throw new Error(errorMsg);
      }

      // Validation côté client
      const fileExtension = params.employeeFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'csv') {
        throw new Error('Only CSV files are allowed');
      }

      if (params.employeeFile.size === 0) {
        throw new Error('File is empty');
      }

      const formData = new FormData();
      formData.append('employeeFile', params.employeeFile);
      
      console.log('Added employeeFile to FormData:', {
        name: params.employeeFile.name,
        size: params.employeeFile.size,
        type: params.employeeFile.type
      });

      console.log('Sending POST request to:', `${BASE_URL}/api/import/import`);

      try {
        const response = await axios.post<ImportResponse>(
          `${BASE_URL}/api/import/import`, 
          formData, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': '*/*',
            },
            timeout: 30000, // 30 secondes timeout
          }
        );
        
        console.log('Import API response received:', {
          status: response.status,
          totalRows: response.data.data?.totalRows,
          message: response.data.message
        });

        return response.data;
      } catch (error) {
        console.error('Import API request failed:', error);
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          if (axiosError.response) {
            // Le serveur a répondu avec un code d'erreur
            throw new Error(axiosError.response.data?.message || 'Import failed');
          } else if (axiosError.request) {
            // La requête a été envoyée mais pas de réponse
            throw new Error('No response from server. Please check your connection.');
          }
        }
        
        throw new Error('An unexpected error occurred during import');
      }
    },
    onSuccess: (data) => {
      console.log('Import mutation succeeded:', {
        fileName: data.data.fileName,
        totalRows: data.data.totalRows,
        message: data.message
      });
      // Optionally invalidate related queries if needed, e.g., employees list
      // queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Import mutation error:', error.message);
    },
  });

  const resetMutation = useMutation<ResetResponse, Error>({
    mutationKey: [...IMPORT_KEY, 'reset'],
    mutationFn: async () => {
      console.log('Reset mutation started');
      console.log('Sending POST request to:', `${BASE_URL}/api/import/reset`);

      try {
        const response = await axios.post<ResetResponse>(
          `${BASE_URL}/api/import/reset`, 
          {}, 
          {
            headers: {
              'Accept': '*/*',
            },
            timeout: 10000, // 10 secondes timeout
          }
        );
        
        console.log('Reset API response received:', {
          status: response.status,
          message: response.data.message
        });

        return response.data;
      } catch (error) {
        console.error('Reset API request failed:', error);
        
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError<ApiErrorResponse>;
          if (axiosError.response) {
            throw new Error(axiosError.response.data?.message || 'Reset failed');
          } else if (axiosError.request) {
            throw new Error('No response from server. Please check your connection.');
          }
        }
        
        throw new Error('An unexpected error occurred during reset');
      }
    },
    onSuccess: (data) => {
      console.log('Reset mutation succeeded:', data.message);
      // Optionally invalidate related queries if needed, e.g., employees list
      // queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Reset mutation error:', error.message);
    },
  });

  return {
    importFiles: importMutation.mutateAsync,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    importData: importMutation.data,
    
    resetData: resetMutation.mutateAsync,
    isResetting: resetMutation.isPending,
    resetError: resetMutation.error,
  };
};