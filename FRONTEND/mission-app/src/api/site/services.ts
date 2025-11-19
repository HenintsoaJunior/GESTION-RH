import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const SITES_BASE_KEY = ['sites'] as const;

export interface Site {
  siteId: string;
  siteName: string;
  code?: string;
  longitude?: number;
  latitude?: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateSiteDTO {
  siteName: string;
  code?: string;
  longitude?: number;
  latitude?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetSitesResponse = ApiResponse<Site[]>;

type GetSiteResponse = ApiResponse<Site>;

export const useGetSites = () => {
  const queryKey = [...SITES_BASE_KEY, 'getAll'] as const;

  return useQuery<GetSitesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Site');
      return response.data;
    },
  });
};

export const useGetSite = (siteId: string) => {
  const queryKey = [...SITES_BASE_KEY, siteId] as const;

  return useQuery<GetSiteResponse, Error>({
    queryKey,
    enabled: !!siteId,
    queryFn: async () => {
      const response = await api.get(`/api/Site/${siteId}`);
      return response.data;
    },
  });
};

export const useCreateSite = () => {
  return useMutation<ApiResponse<Site>, Error, CreateSiteDTO>({
    mutationFn: async (data: CreateSiteDTO) => {
      const payload = {
        SiteName: data.siteName,
        Code: data.code,
        Longitude: data.longitude,
        Latitude: data.latitude,
      };
      const response = await api.post('/api/Site', payload);
      return response.data;
    },
  });
};

export const useUpdateSite = (siteId: string) => {
  return useMutation<ApiResponse<Site>, Error, CreateSiteDTO>({
    mutationFn: async (data: CreateSiteDTO) => {
      const payload = {
        SiteId: siteId,
        SiteName: data.siteName,
        Code: data.code,
        Longitude: data.longitude,
        Latitude: data.latitude,
      };
      const response = await api.put(`/api/Site/${siteId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteSite = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (siteId: string) => {
      const response = await api.delete(`/api/Site/${siteId}`);
      return response.data;
    },
  });
};