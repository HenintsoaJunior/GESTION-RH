import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';
import type { RecruitmentRequestForm } from '@/pages/recruitment/request/hooks/use-request-form';
import type { RequestValidationFormDTO } from '@/pages/recruitment/validation/components/validation-form';

// Base key pour React Query
const SEARCH_REQUESTS_BASE_KEY = ['searchRequests'] as const;
const SEARCH_REQUEST_DETAILS_BASE_KEY = ['searchRequestDetails'] as const;
const SEARCH_STATUSES_BASE_KEY = ['searchRequestStatuses'] as const;
const SEARCH_REASONS_BASE_KEY = ['searchReasons'] as const;
const SEARCH_PENDED_REQUESTS_BASE_KEY = ['searchPendedRequests'] as const;

// Types
export interface FilterRequestDTO {
    post?: string;
    contract?: string;
    status?: string;
    direction?: string;
    maxDate?: string;
    minDate?: string;
}

export interface RequestDTO {
    id: string;
    post: string;
    effective: number;
    contract: string;
    wishedDate: string;
    status: string;
    sendingDate: string;
}

export interface RequestDetailsDTO {
    id: string;
    applicantUser: string;
    status: string;
    isReplacement: boolean;
    replacementDate?: string | null;
    replacementReason?: string | null;
    reasonPrecision?: string | null;
    lastTitular?: string | null;
    sites: string[];
    contract?: string | null;
    contractPrecision?: string | null;
    monthDuration?: number | null;
    beginningDate: string; 
    validationLevel: number;
}

export interface DocumentDTO {
    id: string;
    name: string;
}

interface CreateRequestResponse {
    data: null;
    status: boolean;
    message: string;
}


// Hook pour rechercher les demandes
export const useSearchRequests = (
    filters: FilterRequestDTO,
    page: number = 1, pageSize: number = 10
) => {
    const queryKey = [...SEARCH_REQUESTS_BASE_KEY, { filters, page, pageSize }] as const;

    return useQuery<{ list: RequestDTO[]; totalCount: number }, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get('/api/recruitment/requests', {
                    params: { ...filters, page, pageSize },
                });

                const apiData = response.data.data;

                return {
                    list: apiData.results,
                    totalCount: apiData.totalCount
                };
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        }
    });
};


export const useSearchRequestStatuses = () => {
    const queryKey = [...SEARCH_STATUSES_BASE_KEY] as const;
    return useQuery<{ data:DocumentDTO[] }, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get('/api/recruitment/requests/statuses');
                return {
                    data: response.data.data
                };
            } catch(error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        }
    })
};


export const useGetReplacementReasons = () => {
    const queryKey = [...SEARCH_REASONS_BASE_KEY] as const;
    return useQuery<{ data:DocumentDTO[] }, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get('/api/recruitment/replacement-reasons');
                return response.data;
            } catch(error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        }
    })
};


export const useCreateRecruitmentRequest = () => {
    const queryClient = useQueryClient();
    return useMutation<CreateRequestResponse, Error, RecruitmentRequestForm>({
        mutationFn: (data) => api.post('/api/recruitment/requests', data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ 
            queryKey: SEARCH_REQUESTS_BASE_KEY 
        }),
    });
};


export const useGetUsersByDirection = (direction: string) => {
    return useQuery<{ data: DocumentDTO[] }, Error>({
        queryKey: ['usersByDirection', direction] as const,
        queryFn: async () => {
            try {
                const response = await api.get(`/api/User/directions/${direction}`);
                return response.data;
            } catch(error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        }
    });
};


export const useGetRecruitmentRequestDetails = (id: string) => {
    const queryKey = [...SEARCH_REQUEST_DETAILS_BASE_KEY, id] as const;

    return useQuery<{ data: RequestDetailsDTO }, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get(`/api/recruitment/requests/${id}/details`);
                return response.data;
            } catch(error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        }
    });
};


export const useValidateRecruitmentRequest = () => {
    const queryClient = useQueryClient();
    return useMutation<CreateRequestResponse, Error, RequestValidationFormDTO>({
        mutationFn: (data) => api.post('/api/recruitment/requests/validate', data).then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ 
            queryKey: SEARCH_REQUESTS_BASE_KEY 
        }),
    });
};


export const useSearchPendedRequests = (
    validatorId:string, 
    filters: FilterRequestDTO, page:number = 1, pageSize:number = 10
) => {
    const queryKey = [...SEARCH_PENDED_REQUESTS_BASE_KEY, { validatorId, page, pageSize }] as const;

    return useQuery<{ list: RequestDetailsDTO[]; totalCount: number }, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.post('/api/recruitment/requests/pended', validatorId, {
                    params: { ...filters, page, pageSize },
                });
                const apiData = response.data.data;

                return {
                    list: apiData.results,
                    totalCount: apiData.totalCount
                };
            } catch(error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        }
    });
};
