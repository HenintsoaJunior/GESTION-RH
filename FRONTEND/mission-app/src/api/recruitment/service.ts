import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';

// Base key pour React Query
const SEARCH_REQUESTS_BASE_KEY = ['searchRequests'] as const;


// Types
export interface FilterRequestList {
    post?: string;
    contract?: string;
    status?: string;
    direction?: string;
    maxDate?: string;
    minDate?: string;
}

export interface RequestList {
    id: string;
    post: string;
    effective: number;
    contract: string;
    wishedDate: string;
    status: string;
    sendingDate: string;
}


// Hook pour rechercher les demandes
export const useSearchRequests = (
    filters: FilterRequestList,
    page: number = 1, pageSize: number = 10
) => {
    const queryKey = [...SEARCH_REQUESTS_BASE_KEY, { filters, page, pageSize }] as const;

    return useQuery<{ list: RequestList[]; totalCount: number }, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get('/api/recruitment/requests', {
                    params: { ...filters, page, pageSize },
                });
                return response.data;
            } catch (error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        }
    });
};
