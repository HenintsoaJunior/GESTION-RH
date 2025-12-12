/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/axios-config';

export const MissionTypeEnum = {
  Unknown: 0,
  National: 1,  
  International: 2,
} as const;

export type MissionTypeEnum = typeof MissionTypeEnum[keyof typeof MissionTypeEnum];

export const MissionStatusEnum = {
  Unknown: 0,
  PendingApproval: 1,
  PaymentInProgress: 2,
  Planned: 3,
  InProgress: 4,
  Completed: 5,
  Closed: 6,
  Canceled: 7,
  MissionRejected: 8,
} as const;

export type MissionStatusEnum = typeof MissionStatusEnum[keyof typeof MissionStatusEnum];

// Affichages des statuts de mission
export const MissionStatusDisplay = {
  [MissionStatusEnum.Unknown]: "Inconnu",
  [MissionStatusEnum.PendingApproval]: "En attente de validation",
  [MissionStatusEnum.PaymentInProgress]: "Paiement en cours",
  [MissionStatusEnum.Planned]: "Planifié",
  [MissionStatusEnum.InProgress]: "En cours d'exécution",
  [MissionStatusEnum.Completed]: "Terminé",
  [MissionStatusEnum.Closed]: "Clôturé",
  [MissionStatusEnum.Canceled]: "Annulé",
  [MissionStatusEnum.MissionRejected]: "Mission Rejetée",
} as const;

// Valeurs API pour les statuts (correspondent aux EnumMember en .NET)
export const MissionStatusApiValue = {
  [MissionStatusEnum.Unknown]: "unknown",
  [MissionStatusEnum.PendingApproval]: "pending approval",
  [MissionStatusEnum.PaymentInProgress]: "payment in progress",
  [MissionStatusEnum.Planned]: "planned",
  [MissionStatusEnum.InProgress]: "in progress",
  [MissionStatusEnum.Completed]: "completed",
  [MissionStatusEnum.Closed]: "closed",
  [MissionStatusEnum.Canceled]: "canceled",
  [MissionStatusEnum.MissionRejected]: "mission rejected",
} as const;

// NOUVEAU : Mappage pour convertir les chaînes françaises en valeurs numériques
export const MissionStatusStringToEnum: Record<string, MissionStatusEnum> = {
  'inconnu': MissionStatusEnum.Unknown,
  'unknown': MissionStatusEnum.Unknown,
  'en attente de validation': MissionStatusEnum.PendingApproval,
  'pending approval': MissionStatusEnum.PendingApproval,
  'paiement en cours': MissionStatusEnum.PaymentInProgress,
  'payment in progress': MissionStatusEnum.PaymentInProgress,
  'planifié': MissionStatusEnum.Planned,
  'planned': MissionStatusEnum.Planned,
  "en cours d'exécution": MissionStatusEnum.InProgress,
  'in progress': MissionStatusEnum.InProgress,
  'terminé': MissionStatusEnum.Completed,
  'completed': MissionStatusEnum.Completed,
  'clôturé': MissionStatusEnum.Closed,
  'closed': MissionStatusEnum.Closed,
  'annulé': MissionStatusEnum.Canceled,
  'canceled': MissionStatusEnum.Canceled,
  'mission rejeté': MissionStatusEnum.MissionRejected,
  'mission rejected': MissionStatusEnum.MissionRejected,
};

// NOUVELLE FONCTION : Normaliser le statut (gère à la fois les nombres et les chaînes)
export const normalizeMissionStatus = (status: any): MissionStatusEnum => {
  if (typeof status === 'number') {
    return status as MissionStatusEnum;
  }
  
  if (typeof status === 'string') {
    const lowerStatus = status.toLowerCase().trim();
    return MissionStatusStringToEnum[lowerStatus] || MissionStatusEnum.Unknown;
  }
  
  return MissionStatusEnum.Unknown;
};

// NOUVELLE FONCTION : Récupérer le texte du statut avec normalisation
export const getMissionStatusDisplay = (status: any): string => {
  const normalizedStatus = normalizeMissionStatus(status);
  return MissionStatusDisplay[normalizedStatus] || "Inconnu";
};

export const getMissionStatusApiValue = (status: MissionStatusEnum): string => {
  return MissionStatusApiValue[status] || "unknown";
};

export const fromApiValue = (apiValue: string): MissionStatusEnum => {
  const entries = Object.entries(MissionStatusApiValue);
  const found = entries.find(([_, value]) => value === apiValue);
  return found ? parseInt(found[0]) as MissionStatusEnum : MissionStatusEnum.Unknown;
};

// Options pour les dropdowns/selects
export const MissionStatusOptions = Object.entries(MissionStatusDisplay)
  .filter(([key]) => !isNaN(Number(key))) // Filtrer les clés numériques
  .map(([key, label]) => ({
    value: parseInt(key) as MissionStatusEnum,
    label,
    apiValue: getMissionStatusApiValue(parseInt(key) as MissionStatusEnum)
  }));

export const PaymentTypeEnum = {
  Indemnite: 1,
  NoteFrais: 2,
} as const;

export type PaymentTypeEnum = typeof PaymentTypeEnum[keyof typeof PaymentTypeEnum];

// Affichages des types de paiement
export const PaymentTypeDisplay = {
  [PaymentTypeEnum.Indemnite]: "Indemnité",
  [PaymentTypeEnum.NoteFrais]: "Note de frais",
} as const;

export const getPaymentTypeDisplay = (type: PaymentTypeEnum): string => {
  return PaymentTypeDisplay[type] || "Inconnu";
};

// Affichages des types de mission
export const MissionTypeDisplay = {
  [MissionTypeEnum.Unknown]: "Inconnu",
  [MissionTypeEnum.National]: "Nationale",
  [MissionTypeEnum.International]: "Internationale",
} as const;

export const getMissionTypeDisplay = (type: MissionTypeEnum): string => {
  return MissionTypeDisplay[type] || "Inconnu";
};

export interface Lieu {
  lieuId: string;
  nom: string;
  ville: string | null;
  codePostal: string | null;
  pays: string;
  zoneId: string | null;
  longitude: number | null;
  latitude: number | null;
  geoZone?: any;
  createdAt: string;
  updatedAt: string | null;
}

export interface Employee {
  employeeId: string;
  employeeCode: string;
  lastName: string;
  firstName: string;
  birthDate?: string;
  birthPlace?: string;
  category?: string;
  idNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  phoneNumber: string;
  hireDate: string;
  jobTitle: string;
  contractEndDate: string | null;
  status: string;
  siteId: string;
  site: any;
  genderId?: string;
  gender: any;
  contractTypeId?: string;
  contractType: any;
  directionId?: string;
  direction: any;
  departmentId?: string;
  department: any;
  serviceId?: string;
  service: any;
  unitId?: string;
  unit: any;
  createdAt: string;
  updatedAt: string | null;
}

export interface Transport {
  transportId: string;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

// Mise à jour de l'interface Mission pour accepter à la fois les nombres et les chaînes
export interface Mission {
  missionId: string;
  missionType: MissionTypeEnum;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: any; // Peut être number (MissionStatusEnum) ou string
  lieuId: string;
  lieu: Lieu;
  employeeId: string;
  employee: Employee;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  duration: number;
  isValidated: number;
  type: PaymentTypeEnum;
  allocatedFund: number;
  transportId: string | null;
  transport: Transport | null;
  isVisa: number;
  amountVisaEur: number | null;
  inclPdj: number;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
}

// Interface étendue avec les affichages
export interface MissionWithDisplay extends Mission {
  statusDisplay: string;
  missionTypeDisplay: string;
  paymentTypeDisplay: string;
}

// Fonction pour enrichir une mission avec les affichages (MISE À JOUR)
export const enrichMissionWithDisplay = (mission: Mission): MissionWithDisplay => {
  return {
    ...mission,
    statusDisplay: getMissionStatusDisplay(mission.status),
    missionTypeDisplay: getMissionTypeDisplay(mission.missionType),
    paymentTypeDisplay: getPaymentTypeDisplay(mission.type),
  };
};

export interface CreateMissionInput {
  missionType: MissionTypeEnum;
  type: PaymentTypeEnum;
  name: string;
  description: string;
  status: MissionStatusEnum;
  startDate: string;
  endDate: string;
  lieuId: string;
  employeeId: string;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  duration: number;
  isValidated: number;
  allocatedFund: number;
  transportId?: string | null;
  isVisa: number;
  amountVisaEur: number | null;
  inclPdj: number;
  userId: string;
}

export interface UpdateMissionInput extends Partial<CreateMissionInput> {
  missionId: string;
}

interface MissionSearchData {
  results: Mission[];
  totalCount: number;
  page: number;
  pageSize: number;
}

interface MissionSearchResponseBody {
  data: MissionSearchData;
}

export interface ApiResponse<T = any> {
  data: T | null;
  status: number;
  message: string;
}

type SearchMissionsResponse = ApiResponse<MissionSearchResponseBody>;

export interface CreateMissionResponse {
  data: {
    id: string;
    mission: Mission;
  };
  status: number;
  message: string;
}

export interface MissionSearchFilters {
  name?: string;
  matricule?: string[];
  minStartDate?: string | null;
  maxStartDate?: string | null;
  minEndDate?: string | null;
  maxEndDate?: string | null;
  lieuId?: string;
  employeeId?: string;
  status?: MissionStatusEnum[];
  missionType?: MissionTypeEnum;
  type?: PaymentTypeEnum;
  isVisa?: number;
  inclPdj?: number;
}

export interface OngoingMission {
  missionId: string;
  missionType: MissionTypeEnum;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: any;
  lieuId: string;
  lieu: Lieu;
  employeeId: string;
  employee: Employee;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  duration: number;
  isValidated: number;
  type: PaymentTypeEnum;
  allocatedFund: number;
  transportId: string | null;
  transport: Transport | null;
  isVisa: number;
  amountVisaEur: number | null;
  inclPdj: number;
  userId: string;
  createdAt: string;
  updatedAt: string | null;
}

// Interface avec affichages enrichis
export interface OngoingMissionWithDisplay extends OngoingMission {
  statusDisplay: string;
  missionTypeDisplay: string;
  paymentTypeDisplay: string;
  employeeFullName: string;
  lieuFullName: string;
  formattedStartDate: string;
  formattedEndDate: string;
  durationDisplay: string;
}

// Réponse API type
export interface OngoingMissionsResponse {
  data: OngoingMission[];
  status: number;
  message: string;
}

// Fonction utilitaire pour enrichir une mission avec les affichages
const enrichOngoingMission = (mission: OngoingMission): OngoingMissionWithDisplay => {
  return {
    ...mission,
    statusDisplay: getMissionStatusDisplay(mission.status),
    missionTypeDisplay: getMissionTypeDisplay(mission.missionType),
    paymentTypeDisplay: getPaymentTypeDisplay(mission.type),
    employeeFullName: `${mission.employee?.firstName || ''} ${mission.employee?.lastName || ''}`.trim(),
    lieuFullName: `${mission.lieu?.nom || ''}${mission.lieu?.pays ? `, ${mission.lieu.pays}` : ''}`.trim(),
    formattedStartDate: new Date(mission.startDate).toLocaleDateString('fr-FR'),
    formattedEndDate: new Date(mission.endDate).toLocaleDateString('fr-FR'),
    durationDisplay: `${mission.duration} jour(s)`,
  };
};



const SEARCH_MISSIONS_KEY = ['searchMissions'] as const;

// ============ QUERY HOOKS ============

export const useCloseMission = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    ApiResponse, 
    Error, 
    { missionId: string; userId: string }
  >({
    mutationFn: async ({ missionId, userId }) => {
      const { data } = await api.put(`/api/Mission/${missionId}/close/${userId}`);
      return data;
    },
    
    onSuccess: (_, vars) => {
      // Invalider toutes les requêtes liées aux missions
      queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['mission', vars.missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionWithDisplay', vars.missionId] });
      queryClient.invalidateQueries({ queryKey: ['mission', 'ongoing', 'with-details'] });
      queryClient.invalidateQueries({ queryKey: ['ongoingMissionsCount'] });
      
      // Invalider les statistiques
      queryClient.invalidateQueries({ queryKey: ['progressRate'] });
    },
    
    onError: (error, vars) => {
      console.error(`Erreur lors de la clôture de la mission ${vars.missionId}:`, error);
    },
  });
};


export const useGetOngoingMissionsWithDetails = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: OngoingMissionWithDisplay[]) => void;
  onError?: (error: Error) => void;
}) => {
  return useQuery<OngoingMissionsResponse, Error, OngoingMissionWithDisplay[]>({
    queryKey: ['mission', 'ongoing', 'with-details'],
    
    queryFn: async () => {
      try {
        const response = await api.get('/api/Mission/ongoing-with-details');
        return response.data;
      } catch (error: any) {
        console.error('Erreur lors de la récupération des missions en cours:', error);
        throw new Error(error.response?.data?.message || 'Erreur de chargement des missions');
      }
    },
    
    select: (data) => {
      if (!data?.data) return [];
      const enriched = data.data.map(enrichOngoingMission);
      
      // Appeler onSuccess après transformation si fourni
      if (options?.onSuccess) {
        // Utiliser setTimeout pour éviter les mises à jour pendant le rendu
        setTimeout(() => options.onSuccess!(enriched), 0);
      }
      
      return enriched;
    },
    
    // Options par défaut
    enabled: options?.enabled ?? true,
    staleTime: 30_000, // 30 secondes
    gcTime: 300_000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: options?.refetchInterval,
  });
};


export const useSearchMissions = (
  filters: MissionSearchFilters,
  page: number = 1,
  pageSize: number = 10
) => {
  const queryKey = [...SEARCH_MISSIONS_KEY, filters, page, pageSize] as const;

  return useQuery<SearchMissionsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => {
          if (v === null || v === undefined) return false;
          if (Array.isArray(v)) return v.length > 0;
          if (typeof v === 'string') return v.trim() !== '';
          return true;
        })
      );

      const response = await api.get('/api/Mission/search', {
        params: {
          page,
          pageSize,
          ...cleanFilters,
          ...(cleanFilters.matricule && { matricule: cleanFilters.matricule.join(',') }),
          ...(cleanFilters.status && { status: cleanFilters.status.join(',') }),
        },
      });

      return response.data;
    },
    placeholderData: (prev) => prev ?? undefined,
    staleTime: 30_000,
  });
};

export const useGetMissionById = (missionId: string) => {
  return useQuery<ApiResponse<Mission>, Error>({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const { data } = await api.get(`/api/Mission/${missionId}`);
      return data;
    },
    enabled: !!missionId,
  });
};

// Version avec affichages enrichis
export const useGetMissionByIdWithDisplay = (missionId: string) => {
  return useQuery<ApiResponse<MissionWithDisplay>, Error>({
    queryKey: ['missionWithDisplay', missionId],
    queryFn: async () => {
      const { data } = await api.get(`/api/Mission/${missionId}`);
      
      if (data?.data) {
        return {
          ...data,
          data: enrichMissionWithDisplay(data.data)
        };
      }
      
      return data;
    },
    enabled: !!missionId,
  });
};

export const useGetLieux = () => {
  return useQuery<ApiResponse<Lieu[]>, Error>({
    queryKey: ['lieux'],
    queryFn: () => api.get('/api/Lieu').then(r => r.data),
    staleTime: 300_000,
  });
};

export const useGetEmployees = () => {
  return useQuery<ApiResponse<Employee[]>, Error>({
    queryKey: ['employees'],
    queryFn: () => api.get('/api/Employee').then(r => r.data),
    staleTime: 300_000,
  });
};

export const useGetTransports = () => {
  return useQuery<ApiResponse<Transport[]>, Error>({
    queryKey: ['transports'],
    queryFn: () => api.get('/api/Transport').then(r => r.data),
    staleTime: 300_000,
  });
};

export const useGetOngoingMissionsCount = () => {
  return useQuery<ApiResponse<number>, Error>({
    queryKey: ['ongoingMissionsCount'],
    queryFn: () => api.get('/api/Mission/ongoing-count').then(r => r.data),
  });
};

export const useGetPlannedMissionsThisMonthCount = () => {
  return useQuery<ApiResponse<number>, Error>({
    queryKey: ['plannedMissionsThisMonth'],
    queryFn: () => api.get('/api/Mission/planned-count').then(r => r.data),
  });
};

export const useGetProgressRate = () => {
  return useQuery<ApiResponse<{ progressRate: number; calculationDate: string }>, Error>({
    queryKey: ['progressRate'],
    queryFn: () => api.get('/api/Mission/progress-rate').then(r => r.data),
  });
};

export const useGetMissionTypesRate = () => {
  return useQuery<ApiResponse<{ nationalRate: number; internationalRate: number }>, Error>({
    queryKey: ['missionTypesRate'],
    queryFn: () => api.get('/api/Mission/types-rate').then(r => r.data),
  });
};

// ============ MUTATION HOOKS ============

export const useCreateMission = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateMissionResponse, Error, CreateMissionInput>({
    mutationFn: (data) => api.post('/api/Mission', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY }),
  });
};

export const useUpdateMission = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Mission>, Error, UpdateMissionInput>({
    mutationFn: ({ missionId, ...data }) => api.put(`/api/Mission/${missionId}`, data).then(r => r.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['mission', vars.missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionWithDisplay', vars.missionId] });
    },
  });
};

export const useDeleteMission = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, string>({
    mutationFn: (missionId) => api.delete(`/api/Mission/${missionId}`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY }),
  });
};

export const useCancelMission = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Mission>, Error, { missionId: string; userId: string }>({
    mutationFn: async ({ missionId, userId }) => {
      const { data } = await api.put(`/api/Mission/${missionId}/cancel/${userId}`);
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['mission', vars.missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionWithDisplay', vars.missionId] });
    },
  });
};

export const useDeleteMissionWithUserId = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, { missionId: string; userId: string }>({
    mutationFn: async ({ missionId, userId }) => {
      const { data } = await api.delete(`/api/Mission/${missionId}/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY });
    },
  });
};

export const useValidateMission = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Mission>, Error, string>({
    mutationFn: (missionId) => api.patch(`/api/Mission/${missionId}/validate`).then(r => r.data),
    onSuccess: (_, missionId) => {
      queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionWithDisplay', missionId] });
    },
  });
};

export const useInvalidateMission = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Mission>, Error, string>({
    mutationFn: (missionId) => api.patch(`/api/Mission/${missionId}/invalidate`).then(r => r.data),
    onSuccess: (_, missionId) => {
      queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missionWithDisplay', missionId] });
    },
  });
};

// ============ DOCUMENT GENERATION HOOKS ============

// Fonction utilitaire pour extraire le nom de fichier
function extractFileName(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
  if (utf8Match && utf8Match[1]) {
    return decodeURIComponent(utf8Match[1]);
  }
  
  const stdMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (stdMatch && stdMatch[1]) {
    return stdMatch[1];
  }
  
  return null;
}

// Fonction utilitaire pour télécharger un blob
function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Fonction de validation pour l'Ordre de Mission
export const validateMissionForOrder = (mission: Mission): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!mission.missionId) {
    errors.push('Mission ID manquant');
  }
  
  if (!mission.startDate || !mission.endDate) {
    errors.push('Dates de mission manquantes');
  }
  
  if (!mission.lieuId) {
    errors.push('Lieu de mission manquant');
  }
  
  if (!mission.employeeId) {
    errors.push('Employé manquant');
  }
  
  if (!mission.employee?.employeeCode) {
    errors.push('Matricule de l\'employé manquant');
  }
  
  if (!mission.employee?.lastName || !mission.employee?.firstName) {
    errors.push('Nom complet de l\'employé manquant');
  }
  
  if (!mission.departureDate || !mission.returnDate) {
    errors.push('Dates de départ/retour manquantes');
  }
  
  // Vérifier que la mission est validée (optionnel selon vos règles)
  if (mission.isValidated !== 1) {
    errors.push('La mission doit être validée avant de générer l\'Ordre de Mission');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const useGenerateMissionOrder = () => {
  return useMutation<{ fileName: string; status: string }, Error, { missionId?: string; employeeId?: string; skipValidation?: boolean }>({
    mutationFn: async (params) => {
      const { missionId, employeeId, skipValidation = false } = params;
      
      // Si on a un missionId, on peut faire une validation préalable
      if (missionId && !skipValidation) {
        try {
          const missionResponse = await api.get(`/api/Mission/${missionId}`);
          const mission = missionResponse.data?.data;
          
          if (mission) {
            const validation = validateMissionForOrder(mission);
            if (!validation.isValid) {
              throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
            }
          }
        } catch (error) {
          console.warn('Validation préalable échouée, poursuite de la génération', error);
        }
      }
      
      const response = await api.post('/api/Mission/OM', 
        { 
          missionId: missionId || null, 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      let fileName: string;
      if (extractedFileName) {
        fileName = extractedFileName;
      } else {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        fileName = `OrdreMission-${missionId || employeeId || 'document'}-${timestamp}.pdf`;
      }
      
      downloadBlob(blob, fileName);
      return { fileName, status: 'success' };
    },
  });
};

export const usePreviewMissionOrder = () => {
  return useMutation<{ blobUrl: string; fileName: string; status: string }, Error, { missionId?: string; employeeId?: string }>({
    mutationFn: async (params) => {
      const { missionId, employeeId } = params;
      const response = await api.post('/api/Mission/OM', 
        { 
          missionId: missionId || null, 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      const fileName = extractedFileName || `OrdreMission-${missionId || employeeId || 'document'}.pdf`;
      const blobUrl = window.URL.createObjectURL(blob);
      
      return { blobUrl, fileName, status: 'success' };
    },
  });
};

export const useGenerateIM = () => {
  return useMutation<{ fileName: string; status: string }, Error, { missionId?: string; employeeId?: string }>({
    mutationFn: async (params) => {
      const { missionId, employeeId } = params;
      const response = await api.post('/api/Mission/IM', 
        { 
          missionId: missionId || null, 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      const fileName = extractedFileName || `IndemniteMission-${missionId || employeeId || 'document'}.pdf`;
      downloadBlob(blob, fileName);
      
      return { fileName, status: 'success' };
    },
  });
};

export const usePreviewIM = () => {
  return useMutation<{ blobUrl: string; fileName: string; status: string }, Error, { missionId?: string; employeeId?: string }>({
    mutationFn: async (params) => {
      const { missionId, employeeId } = params;
      const response = await api.post('/api/Mission/IM', 
        { 
          missionId: missionId || null, 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      const fileName = extractedFileName || `IndemniteMission-${missionId || employeeId || 'document'}.pdf`;
      const blobUrl = window.URL.createObjectURL(blob);
      
      return { blobUrl, fileName, status: 'success' };
    },
  });
};


export const usePreviewATD = () => {
  return useMutation<{ blobUrl: string; fileName: string; status: string }, Error, { employeeId?: string }>({
    mutationFn: async (params) => {
      const { employeeId } = params;
      const response = await api.post('/api/Mission/ATD', 
        { 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      const fileName = extractedFileName || `Attestation_Employe-${employeeId || 'document'}.pdf`;
      const blobUrl = window.URL.createObjectURL(blob);
      
      return { blobUrl, fileName, status: 'success' };
    },
  });
};

export const useGenerateATD = () => {
  return useMutation<{ fileName: string; status: string }, Error, { employeeId?: string }>({
    mutationFn: async (params) => {
      const { employeeId } = params;
      const response = await api.post('/api/Mission/ATD', 
        { 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      const fileName = extractedFileName || `Attestation_Employe-${employeeId || 'document'}.pdf`;
      downloadBlob(blob, fileName);
      
      return { fileName, status: 'success' };
    },
  });
};

export const useGenerateAccommodationCertificate = () => {
  return useMutation<{ fileName: string; status: string }, Error, { missionId?: string; employeeId?: string }>({
    mutationFn: async (params) => {
      const { missionId, employeeId } = params;
      const response = await api.post('/api/Mission/ATH', 
        { 
          missionId: missionId || null, 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      const fileName = extractedFileName || `Attestation_Hebergement-${missionId || employeeId || 'document'}.pdf`;
      downloadBlob(blob, fileName);
      
      return { fileName, status: 'success' };
    },
  });
};

export const usePreviewAccommodationCertificate = () => {
  return useMutation<{ blobUrl: string; fileName: string; status: string }, Error, { missionId?: string; employeeId?: string }>({
    mutationFn: async (params) => {
      const { missionId, employeeId } = params;
      const response = await api.post('/api/Mission/ATH', 
        { 
          missionId: missionId || null, 
          employeeId: employeeId || null 
        }, 
        { 
          responseType: 'blob' 
        }
      );
      
      const blob = response.data;
      if (!blob || blob.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      const contentDisposition = response.headers['content-disposition'];
      const extractedFileName = extractFileName(contentDisposition);
      
      const fileName = extractedFileName || `Attestation_Hebergement-${missionId || employeeId || 'document'}.pdf`;
      const blobUrl = window.URL.createObjectURL(blob);
      
      return { blobUrl, fileName, status: 'success' };
    },
  });
};

// Hook utilitaire pour gérer tous les types de documents
export interface DocumentType {
  id: string;
  name: string;
  generateFunction: (params: { missionId?: string; employeeId?: string }) => Promise<{ fileName: string; status: string }>;
  previewFunction?: (params: { missionId?: string; employeeId?: string }) => Promise<{ blobUrl: string; fileName: string; status: string }>;
  requiredFields: ('missionId' | 'employeeId')[];
}

export const useDocumentGeneration = () => {
  const generateOM = useGenerateMissionOrder();
  const generateATD = useGenerateATD();
  const generateIM = useGenerateIM();
  const generateHebergement = useGenerateAccommodationCertificate();
  const previewOM = usePreviewMissionOrder();
  const previewHebergement = usePreviewAccommodationCertificate();

  const documentTypes: Record<string, DocumentType> = {
    'ordre-mission': {
      id: 'ordre-mission',
      name: 'Ordre de Mission',
      generateFunction: (params) => generateOM.mutateAsync(params),
      previewFunction: (params) => previewOM.mutateAsync(params),
      requiredFields: ['missionId']
    },
    'attestation-employe': {
      id: 'attestation-employe',
      name: 'Attestation Employé',
      generateFunction: (params) => generateATD.mutateAsync(params),
      requiredFields: ['employeeId']
    },
    'indemnite-mission': {
      id: 'indemnite-mission',
      name: 'Indemnité de Mission',
      generateFunction: (params) => generateIM.mutateAsync(params),
      requiredFields: ['missionId']
    },
    'attestation-hebergement': {
      id: 'attestation-hebergement',
      name: 'Attestation Hébergement',
      generateFunction: (params) => generateHebergement.mutateAsync(params),
      previewFunction: (params) => previewHebergement.mutateAsync(params),
      requiredFields: ['missionId', 'employeeId']
    }
  };

  const generateDocument = async (
    documentId: string, 
    params: { missionId?: string; employeeId?: string }
  ): Promise<{ fileName: string; status: string }> => {
    const docType = documentTypes[documentId];
    
    if (!docType) {
      throw new Error(`Type de document non supporté: ${documentId}`);
    }
    
    // Vérifier les champs requis
    for (const field of docType.requiredFields) {
      if (!params[field]) {
        throw new Error(`Champ requis manquant: ${field} pour ${docType.name}`);
      }
    }
    
    return docType.generateFunction(params);
  };

  const previewDocument = async (
    documentId: string,
    params: { missionId?: string; employeeId?: string }
  ): Promise<{ blobUrl: string; fileName: string; status: string }> => {
    const docType = documentTypes[documentId];
    
    if (!docType) {
      throw new Error(`Type de document non supporté: ${documentId}`);
    }
    
    if (!docType.previewFunction) {
      throw new Error(`Prévisualisation non disponible pour: ${docType.name}`);
    }
    
    // Vérifier les champs requis
    for (const field of docType.requiredFields) {
      if (!params[field]) {
        throw new Error(`Champ requis manquant: ${field} pour ${docType.name}`);
      }
    }
    
    return docType.previewFunction(params);
  };

  return {
    documentTypes,
    generateDocument,
    previewDocument,
    isLoading: {
      ordreMission: generateOM.isPending,
      attestationEmploye: generateATD.isPending,
      indemniteMission: generateIM.isPending,
      attestationHebergement: generateHebergement.isPending
    }
  };
};

// ============ CACHE MANAGEMENT ============

export const useMissionCache = () => {
  const queryClient = useQueryClient();

  const invalidateMissions = () => {
    queryClient.invalidateQueries({ queryKey: SEARCH_MISSIONS_KEY });
  };

  const updateMissionInCache = (missionId: string, updatedMission: Mission) => {
    queryClient.setQueryData(['mission', missionId], (old: ApiResponse<Mission> | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: updatedMission,
      } as ApiResponse<Mission>;
    });

    // Mettre à jour avec affichages
    queryClient.setQueryData(['missionWithDisplay', missionId], (old: ApiResponse<MissionWithDisplay> | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: enrichMissionWithDisplay(updatedMission),
      } as ApiResponse<MissionWithDisplay>;
    });

    queryClient.setQueriesData({ queryKey: SEARCH_MISSIONS_KEY }, (old: SearchMissionsResponse | undefined) => {
      if (!old?.data?.data?.results) return old;
      
      return {
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            results: old.data.data.results.map(m => 
              m.missionId === missionId ? updatedMission : m
            ),
          },
        },
      };
    });
  };

  return { invalidateMissions, updateMissionInCache };
};

// ============ HOOK PERSONNALISÉ POUR LES OPTIONS ============

export const useMissionEnums = () => {
  const missionTypeOptions = [
    { value: MissionTypeEnum.National, label: getMissionTypeDisplay(MissionTypeEnum.National) },
    { value: MissionTypeEnum.International, label: getMissionTypeDisplay(MissionTypeEnum.International) },
  ];

  const paymentTypeOptions = [
    { value: PaymentTypeEnum.Indemnite, label: getPaymentTypeDisplay(PaymentTypeEnum.Indemnite) },
    { value: PaymentTypeEnum.NoteFrais, label: getPaymentTypeDisplay(PaymentTypeEnum.NoteFrais) },
  ];

  return {
    missionStatusOptions: MissionStatusOptions,
    missionTypeOptions,
    paymentTypeOptions,
    getMissionStatusDisplay,
    getMissionTypeDisplay,
    getPaymentTypeDisplay,
    getMissionStatusApiValue,
    fromApiValue,
    normalizeMissionStatus,
    validateMissionForOrder,
  };
};