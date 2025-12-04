import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import api from '@/utils/axios-config';

// Clé de base pour toutes les queries liées aux lieux
const LIEUX_BASE_KEY = ['lieux'] as const;

// ========================
// Interfaces & Types
// ========================

export interface GeoZone {
  zoneId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Lieu {
  lieuId: string;
  nom: string;
  ville: string | null;
  codePostal: string | null;
  pays: string;
  latitude: number;
  longitude: number;
  zoneId: string | null;
  geoZone?: GeoZone;
  createdAt: string;
  updatedAt: string | null;
}

export interface LieuDTOForm {
  nom: string;
  ville?: string | null;
  codePostal?: string | null;
  pays: string;
  latitude: number;
  longitude: number;
  zoneId?: string | null;
}

export interface LieuSearchFilters {
  nom?: string;
  ville?: string;
  pays?: string;
  zoneId?: string;
}

interface SearchData {
  data: Lieu[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

// Réponses spécifiques
type GetLieuxResponse = SearchData;
type GetAllLieuxResponse = ApiResponse<Lieu[]>;
type GetLieuByIdResponse = ApiResponse<Lieu>;
type CreateLieuResponse = ApiResponse<{ id: string; lieu: Lieu }>;

// ========================
// Queries
// ========================

export const useGetLieux = (
  filters: LieuSearchFilters = {},
  page: number = 1,
  pageSize: number = 10
) => {
  const queryKey = [...LIEUX_BASE_KEY, 'search', { ...filters, page, pageSize }] as const;

  return useQuery<GetLieuxResponse, Error>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(filters.nom && { nom: filters.nom }),
        ...(filters.ville && { ville: filters.ville }),
        ...(filters.pays && { pays: filters.pays }),
        ...(filters.zoneId && { zoneId: filters.zoneId }),
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await api.get(`/api/Lieu/search?${params.toString()}`);
      return response.data;
    },
  });
};

export const useGetAllLieux = () => {
  const queryKey = [...LIEUX_BASE_KEY, 'all'] as const;

  return useQuery<GetAllLieuxResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Lieu');
      return response.data;
    },
  });
};

// Alias pour compatibilité ascendante
export const useLieux = useGetAllLieux;

export const useGetLieuById = (lieuId: string) => {
  const queryKey = [...LIEUX_BASE_KEY, lieuId] as const;

  return useQuery<GetLieuByIdResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get(`/api/Lieu/${lieuId}`);
      return response.data;
    },
    enabled: !!lieuId,
  });
};

// ========================
// Invalidation Helper
// ========================

const useInvalidateLieux = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: LIEUX_BASE_KEY });
};

// ========================
// Mutations avec invalidation automatique
// ========================

export const useCreateLieu = () => {
  const invalidateLieux = useInvalidateLieux();

  return useMutation<CreateLieuResponse, Error, LieuDTOForm>({
    mutationFn: async (data: LieuDTOForm) => {
      const payload = {
        Nom: data.nom,
        Ville: data.ville ?? null,
        CodePostal: data.codePostal ?? null,
        Pays: data.pays,
        Latitude: data.latitude,
        Longitude: data.longitude,
        ...(data.zoneId && { ZoneId: data.zoneId }),
      };
      const response = await api.post('/api/Lieu', payload);
      return response.data;
    },
    onSuccess: () => {
      invalidateLieux();
    },
  });
};

export const useUpdateLieu = (lieuId: string) => {
  const queryClient = useQueryClient();
  const invalidateLieux = useInvalidateLieux();

  return useMutation<ApiResponse<Lieu>, Error, LieuDTOForm>({
    mutationFn: async (data: LieuDTOForm) => {
      const payload = {
        LieuId: lieuId,
        Nom: data.nom,
        Ville: data.ville ?? null,
        CodePostal: data.codePostal ?? null,
        Pays: data.pays,
        Latitude: data.latitude,
        Longitude: data.longitude,
        ...(data.zoneId !== undefined && { ZoneId: data.zoneId }),
      };
      const response = await api.put(`/api/Lieu/${lieuId}`, payload);
      return response.data;
    },
    onSuccess: (response) => {
      // Invalide toutes les listes et recherches
      invalidateLieux();

      // Mise à jour optimiste du détail du lieu (évite un refetch complet)
      if (response.data) {
        queryClient.setQueryData<GetLieuByIdResponse>(
          [...LIEUX_BASE_KEY, lieuId],
          response
        );
      }
    },
  });
};

export const useDeleteLieu = () => {
  const queryClient = useQueryClient();
  const invalidateLieux = useInvalidateLieux();

  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (lieuId: string) => {
      const response = await api.delete(`/api/Lieu/${lieuId}`);
      return response.data;
    },
    onSuccess: (_data, lieuId) => {
      invalidateLieux();

      // Supprime le détail du lieu du cache (évite 404 si on y accède après suppression)
      queryClient.removeQueries({
        queryKey: [...LIEUX_BASE_KEY, lieuId],
        exact: true,
      });
    },
  });
};