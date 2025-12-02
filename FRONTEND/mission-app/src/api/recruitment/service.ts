import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

// Base key pour React Query
const SEARCH_REQUESTS_BASE_KEY = ['searchRequests'] as const;
const SEARCH_STATUSES_BASE_KEY = ['searchRequestStatuses'] as const;

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

export interface StatusDTO {
    id: string;
    name: string;
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
    return useQuery<{ data:StatusDTO[] }, Error>({
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
