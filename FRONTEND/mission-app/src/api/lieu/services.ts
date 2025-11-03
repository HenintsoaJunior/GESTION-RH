import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const LIEUX_BASE_KEY = ['lieux'] as const;

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

type GetLieuxResponse = SearchData;

type GetAllLieuxResponse = ApiResponse<Lieu[]>;

type GetLieuByIdResponse = ApiResponse<Lieu>;

type CreateLieuResponse = ApiResponse<{ id: string; lieu: Lieu }>;

export const useGetLieux = (filters: LieuSearchFilters = {}, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...LIEUX_BASE_KEY, { ...filters, page, pageSize }] as const;

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
  const queryKey = [...LIEUX_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllLieuxResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Lieu');
      return response.data;
    },
  });
};

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

export const useCreateLieu = () => {
  return useMutation<CreateLieuResponse, Error, LieuDTOForm>({
    mutationFn: async (data: LieuDTOForm) => {
      const payload = {
        Nom: data.nom,
        Ville: data.ville,
        CodePostal: data.codePostal,
        Pays: data.pays,
        ...(data.zoneId && { ZoneId: data.zoneId }),
      };
      const response = await api.post('/api/Lieu', payload);
      return response.data;
    },
  });
};

export const useUpdateLieu = (lieuId: string) => {
  return useMutation<ApiResponse<Lieu>, Error, LieuDTOForm>({
    mutationFn: async (data: LieuDTOForm) => {
      const payload = {
        LieuId: lieuId,
        Nom: data.nom,
        Ville: data.ville,
        CodePostal: data.codePostal,
        Pays: data.pays,
        ...(data.zoneId && { ZoneId: data.zoneId }),
      };
      const response = await api.put(`/api/Lieu/${lieuId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteLieu = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (lieuId: string) => {
      const response = await api.delete(`/api/Lieu/${lieuId}`);
      return response.data;
    },
  });
};