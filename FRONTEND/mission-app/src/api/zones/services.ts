import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/utils/axios-config';

const GEO_ZONES_BASE_KEY = ['geoZones'] as const;

export interface GeoZone {
  zoneId: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface GeoZoneDTOForm {
  name: string;
}

interface SearchData {
  data: GeoZone[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

type GetGeoZonesResponse = SearchData;

type GetAllGeoZonesResponse = ApiResponse<GeoZone[]>;

export const useGetGeoZones = (name?: string, page: number = 1, pageSize: number = 10) => {
  const queryKey = [...GEO_ZONES_BASE_KEY, { name, page, pageSize }] as const;

  return useQuery<GetGeoZonesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/GeoZone/search', {
        params: { name, page, pageSize },
      });
      return response.data;
    },
  });
};

export const useGetAllGeoZones = () => {
  const queryKey = [...GEO_ZONES_BASE_KEY, 'getAll'] as const;

  return useQuery<GetAllGeoZonesResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/GeoZone');
      return response.data;
    },
  });
};

export const useCreateGeoZone = () => {
  return useMutation<ApiResponse<GeoZone>, Error, GeoZoneDTOForm>({
    mutationFn: async (data: GeoZoneDTOForm) => {
      const payload = {
        Name: data.name,
      };
      const response = await api.post('/api/GeoZone', payload);
      return response.data;
    },
  });
};

export const useUpdateGeoZone = (zoneId: string) => {
  return useMutation<ApiResponse<GeoZone>, Error, GeoZoneDTOForm>({
    mutationFn: async (data: GeoZoneDTOForm) => {
      const payload = {
        ZoneId: zoneId,
        Name: data.name,
      };
      const response = await api.put(`/api/GeoZone/${zoneId}`, payload);
      return response.data;
    },
  });
};

export const useDeleteGeoZone = () => {
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (zoneId: string) => {
      const response = await api.delete(`/api/GeoZone/${zoneId}`);
      return response.data;
    },
  });
};                                                                          