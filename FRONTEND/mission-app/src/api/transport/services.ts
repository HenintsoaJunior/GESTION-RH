import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import api from '@/utils/axios-config';

// Clé de base pour toutes les queries liées aux transports
const TRANSPORTS_BASE_KEY = ['transports'] as const;

// ========================
// Interfaces & Types
// ========================

export interface Transport {
  transportId: string;
  type: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface TransportDTOForm {
  type: string;
}

interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
}

// Réponses spécifiques
type GetAllTransportsResponse = ApiResponse<Transport[]>;
type GetTransportByIdResponse = ApiResponse<Transport>;
type MutationResponse = ApiResponse<{ message: string } | Transport>;

// ========================
// Queries
// ========================

export const useGetAllTransports = () => {
  const queryKey = [...TRANSPORTS_BASE_KEY, 'all'] as const;

  return useQuery<GetAllTransportsResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get('/api/Transport');
      return response.data;
    },
  });
};

// Alias pour compatibilité ascendante (comme useLieux = useGetAllLieux)
export const useTransports = useGetAllTransports;

export const useGetTransportById = (transportId: string) => {
  const queryKey = [...TRANSPORTS_BASE_KEY, transportId] as const;

  return useQuery<GetTransportByIdResponse, Error>({
    queryKey,
    queryFn: async () => {
      const response = await api.get(`/api/Transport/${transportId}`);
      return response.data;
    },
    enabled: !!transportId,
  });
};

// ========================
// Invalidation Helper
// ========================

const useInvalidateTransports = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: TRANSPORTS_BASE_KEY });
};

// ========================
// Mutations avec invalidation automatique
// ========================

export const useCreateTransport = () => {
  const invalidateTransports = useInvalidateTransports();

  return useMutation<MutationResponse, Error, TransportDTOForm>({
    mutationFn: async (data: TransportDTOForm) => {
      const payload = {
        Type: data.type,
      };
      const response = await api.post('/api/Transport', payload);
      return response.data;
    },
    onSuccess: () => {
      invalidateTransports();
    },
  });
};

export const useUpdateTransport = (transportId: string) => {
  const queryClient = useQueryClient();
  const invalidateTransports = useInvalidateTransports();

  return useMutation<ApiResponse<Transport>, Error, TransportDTOForm>({
    mutationFn: async (data: TransportDTOForm) => {
      const payload = {
        TransportId: transportId,
        Type: data.type,
      };
      const response = await api.put(`/api/Transport/${transportId}`, payload);
      return response.data;
    },
    onSuccess: (response) => {
      // Invalide toutes les listes
      invalidateTransports();

      // Mise à jour optimiste du détail (évite un refetch complet)
      if (response.data) {
        queryClient.setQueryData<GetTransportByIdResponse>(
          [...TRANSPORTS_BASE_KEY, transportId],
          response
        );
      }
    },
  });
};

export const useDeleteTransport = () => {
  const queryClient = useQueryClient();
  const invalidateTransports = useInvalidateTransports();

  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: async (transportId: string) => {
      const response = await api.delete(`/api/Transport/${transportId}`);
      return response.data;
    },
    onSuccess: (_data, transportId) => {
      invalidateTransports();

      // Supprime le détail du transport du cache
      queryClient.removeQueries({
        queryKey: [...TRANSPORTS_BASE_KEY, transportId],
        exact: true,
      });
    },
  });
};