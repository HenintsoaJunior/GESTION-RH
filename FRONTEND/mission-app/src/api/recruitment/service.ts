import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/utils/axios-config';
import type { RecruitmentRequestForm } from '@/pages/recruitment/request/hooks/use-request-form';
import type { RequestValidationFormDTO } from '@/pages/recruitment/validation/components/validation-form';
import type { JobDescriptionEditForm, JobDescriptionForm } from '@/pages/recruitment/job-description/hooks/use-job-form';

// Base key pour React Query
const SEARCH_REQUESTS_BASE_KEY = ['searchRequests'] as const;
const SEARCH_REQUEST_DETAILS_BASE_KEY = ['searchRequestDetails'] as const;
const SEARCH_STATUSES_BASE_KEY = ['searchRequestStatuses'] as const;
const SEARCH_REASONS_BASE_KEY = ['searchReasons'] as const;
const SEARCH_PENDED_REQUESTS_BASE_KEY = ['searchPendedRequests'] as const;
const CHECK_ACCESS_BASE_KEY = ['isUserValidator'] as const;
const HAS_JOB_DESC_BASE_KEY = ['hasJobDescription'] as const;
const SEARCH_JOB_DESC_BASE_KEY = ['searchJobDescriptions'] as const;

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
    post: string;
    applicantUser: string;
    direction: string;
    department: string;
    service: string;
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
    isPlanned?: boolean;
    notPlannedReason?: string | null;
}

export interface RequestEditDTO {
    id: string;
    post: string;
    effective: number;
    contractId: string | null;
    contractPrecision: string | null;
    monthDuration: number | null;
    sites: string[];
    isReplacement: boolean;
    replacementReasonId?: string | null;
    replacementDate?: string | null;
    reasonPrecision?: string | null;
    lastTitularId?: string | null;
    isPlanned: boolean;
    notPlannedReason: string | null;
    beginningDate: string; 
    applicantUserId: string;
}

export interface RequestValidationDTO {
    direction: string;
    applicantUser: string;
    signatureBase64?: string | null;
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

export interface JobDescriptionDetails {
  id: string;
  post: string;
  requestId: string;
  mission: string;
  attributions: string[];
  formations: string[];
  experiences: string[];
  softSkills: string[];
  skills: string[];
  lastTitular: string | null;
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
        mutationFn: async (data) => 
            await api.post('/api/recruitment/requests', data).then(r => r.data),

        onSuccess: () => queryClient.invalidateQueries({ 
            queryKey: SEARCH_REQUESTS_BASE_KEY 
        }),
    });
};

export const useDeleteRequest = () => {
    const queryClient = useQueryClient(); // pour rafraîchir les listes après suppression

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await api.delete(`/api/recruitment/requests/${id}`);
            return response.data; // { data, status, message }
        },
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

    return useQuery<{
        details: RequestDetailsDTO;
        validations: RequestValidationDTO[];
    }, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get(`/api/recruitment/requests/${id}/details`);

                    return {
                    details: response.data.data.details,
                    validations: response.data.data.validations
                };
            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || "Erreur serveur");
                }
                throw error;
            }
        },
        enabled: !!id
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


export const useHasValidationInRecruitment = (user: string | undefined) => {
    const queryKey = [...CHECK_ACCESS_BASE_KEY, { user }] as const;

    return useQuery<{hasValidation: boolean}, Error>({
        queryKey,
        queryFn: async () => {
            if(!user) throw new Error('ID est requis pour vérifier les validations');
            
            try {
                const response = await api.get('/api/recruitment/requests/check-validator', {
                    params: { user },
                });
                const apiData = response.data.data;

                return { hasValidation: apiData };
            } catch(error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || 'Erreur serveur');
                }
                throw error;
            }
        },
        enabled: !!user
    });
};


export const useGetAllEducations = () => {
    return useQuery<{ data: DocumentDTO[] }, Error>({
        queryKey: ['getAllEducations'] as const,

        queryFn: async () => {
            try {
                const response = await api.get(`/api/recruitment/params/educations`);
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

export const useGetAllLevelEducations = () => {
    return useQuery<{ data: DocumentDTO[] }, Error>({
        queryKey: ['getAllLevelEducations'] as const,

        queryFn: async () => {
            try {
                const response = await api.get(`/api/recruitment/params/level-educations`);
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

export const useGetAllSoftSkills = () => {
    return useQuery<{ data: DocumentDTO[] }, Error>({
        queryKey: ['getAllSoftSkills'] as const,

        queryFn: async () => {
            try {
                const response = await api.get(`/api/recruitment/params/soft-skills`);
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

export const useAddJobDescription = () => {
    const queryClient = useQueryClient();
    return useMutation<CreateRequestResponse, Error, JobDescriptionForm>({
        mutationFn: (data) => api.post('/api/recruitment/job-descriptions', data)
            .then(r => r.data),
        onSuccess: () => queryClient.invalidateQueries({ 
            queryKey: SEARCH_JOB_DESC_BASE_KEY 
        }),
    });
};

export const useGetJobDescriptionDetails = (id: string) => {
    const queryKey = [...SEARCH_JOB_DESC_BASE_KEY, id] as const;

    return useQuery<{data: JobDescriptionDetails}, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get(`/api/recruitment/job-descriptions/requests/${id}`);

                return response.data;
            } catch (error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || "Erreur serveur");
                }
                throw error;
            }
        },
        enabled: !!id
    });
};

export const useHasJobDescription = (id: string) => {
    const queryKey = [...HAS_JOB_DESC_BASE_KEY, id] as const;

    return useQuery<{hasJobDescription:boolean}, Error>({
        queryKey,
        queryFn: async () => {
            try {
                const response = await api.get(`/api/recruitment/job-descriptions/requests/${id}/has`);
                const hasValue = response.data.data;

                return {hasJobDescription : hasValue};
            } catch (error) {
                if(axios.isAxiosError(error) && error.response) {
                    throw new Error(error.response.data?.message || "Erreur serveur");
                }
                throw error;
            }
        },
        enabled: !!id
    });
};


// UPDATE : Demande de recrutement
export const useGetRecruitmentRequest = (id?: string) => {
    return useQuery<RequestEditDTO, Error>({
        queryKey: ["getRecruitmentRequestById", id],
        queryFn: async () => {
            const response = await api.get(`/api/recruitment/requests/${id}`);
            return response.data.data;
        },
        enabled: !!id, // ⛔️ n'appelle pas si id undefined
    });
};

export const useUpdateRecruitmentRequest = (id?: string) => {
    const queryClient = useQueryClient();

    return useMutation<CreateRequestResponse, Error, RecruitmentRequestForm>({
        mutationFn: async (data) => 
            await api.put(`/api/recruitment/requests/${id}`, data).then(r => r.data),

        onSuccess: () => queryClient.invalidateQueries({ 
            queryKey: SEARCH_REQUESTS_BASE_KEY 
        }),
    });
};


// UPDATE : Fiche de poste
export const useGetJobDescription = (id?: string) => {
    return useQuery<RequestEditDTO, Error>({
        queryKey: ["getJobDescriptionById", id],
        queryFn: async () => {
            const response = await api.get(`/api/recruitment/job-descriptions/${id}`);
            return response.data.data;
        },
        enabled: !!id, // ⛔️ n'appelle pas si id undefined
    });
};

export const useUpdateJobDescription = (id? : string) => {
    const queryClient = useQueryClient();

    return useMutation<CreateRequestResponse, Error, JobDescriptionForm>({
        mutationFn: async (data) => 
            await api.put(`/api/recruitment/job-descriptions/${id}`, data).then(r => r.data),

        onSuccess: () => queryClient.invalidateQueries({ 
            queryKey: SEARCH_JOB_DESC_BASE_KEY 
        }),
    });
};
