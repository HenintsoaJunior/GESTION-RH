import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config/api-config';

// Interfaces pour les données LDAP
export interface UserAd {
  userId: string;
  matricule: string;
  displayName: string;
  email: string;
  title: string;
  userDn: string;
  department: string;
  isActive: boolean;
  directReports?: UserAd[];
}

export interface SyncStatistics {
  usersAdded: number;
  usersUpdated: number;
  usersDeleted: number;
  totalProcessed: number;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  statistics?: SyncStatistics;
  timestamp: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  timestamp: string;
}

// Hook pour la synchronisation des utilisateurs
export const useSyncUsers = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const syncUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.post<SyncResponse>(
        `${BASE_URL}/api/Ldap/sync`,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des utilisateurs:', error);
      
      let errorMessage = 'Erreur lors de la synchronisation des utilisateurs';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data as ErrorResponse;
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          }
        } else if (error.request) {
          errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion.';
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { syncUsers, isLoading, error };
};

// Hook pour récupérer les utilisateurs depuis Active Directory
export const useGetUsersFromAD = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<UserAd[]>(`${BASE_URL}/api/Ldap`, {
        headers: {
          accept: '*/*',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs AD:', error);
      
      let errorMessage = 'Erreur lors de la récupération des utilisateurs depuis Active Directory';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data as string | ErrorResponse;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (typeof errorData === 'object' && errorData.message) {
            errorMessage = errorData.message;
          }
        } else if (error.request) {
          errorMessage = 'Aucune réponse du serveur. Vérifiez votre connexion.';
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { getUsers, isLoading, error };
};

// Hook pour récupérer la hiérarchie organisationnelle
export const useGetOrganisationHierarchy = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHierarchy = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<UserAd[]>(`${BASE_URL}/api/Ldap/AD/hierarchy`, {
        headers: {
          accept: '*/*',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la hiérarchie:', error);
      
      let errorMessage = 'Erreur lors de la récupération de la hiérarchie organisationnelle';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data as string | ErrorResponse;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (typeof errorData === 'object' && errorData.message) {
            errorMessage = errorData.message;
          }
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { getHierarchy, isLoading, error };
};

// Hook pour récupérer le manager d'un utilisateur
export interface GetManagerParams {
  displayName?: string;
  mail?: string;
}

export const useGetManager = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getManager = async (params: GetManagerParams) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!params.displayName && !params.mail) {
        throw new Error('Soit displayName soit mail doit être fourni');
      }

      const response = await axios.get<UserAd>(`${BASE_URL}/api/Ldap/manager`, {
        params,
        headers: {
          accept: '*/*',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du manager:', error);
      
      let errorMessage = 'Erreur lors de la récupération du manager';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Manager non trouvé';
          } else {
            const errorData = error.response.data as string | ErrorResponse;
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (typeof errorData === 'object' && errorData.message) {
              errorMessage = errorData.message;
            }
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { getManager, isLoading, error };
};

// Hook principal combinant toutes les fonctionnalités LDAP
export const useLdapService = () => {
  const usersHook = useGetUsersFromAD();
  const hierarchyHook = useGetOrganisationHierarchy();
  const managerHook = useGetManager();
  const syncHook = useSyncUsers();

  return {
    getUsersFromAD: usersHook.getUsers,
    isGettingUsers: usersHook.isLoading,
    usersError: usersHook.error,
    
    getOrganisationHierarchy: hierarchyHook.getHierarchy,
    isGettingHierarchy: hierarchyHook.isLoading,
    hierarchyError: hierarchyHook.error,
    
    getManager: managerHook.getManager,
    isGettingManager: managerHook.isLoading,
    managerError: managerHook.error,
    
    syncUsers: syncHook.syncUsers,
    isSyncing: syncHook.isLoading,
    syncError: syncHook.error,
  };
};

interface SyncState {
  isSyncing: boolean;
  lastSyncResult?: SyncResponse;
  lastSyncError?: string;
  lastSyncTime?: Date;
}

export const useLdapSync = () => {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
  });

  const { syncUsers, isLoading } = useSyncUsers();

  const performSync = async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, lastSyncError: undefined }));
    
    try {
      const result = await syncUsers();
      
      setSyncState({
        isSyncing: false,
        lastSyncResult: result,
        lastSyncTime: new Date(),
      });
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setSyncState({
        isSyncing: false,
        lastSyncError: errorMessage,
        lastSyncTime: new Date(),
      });
      
      throw error;
    }
  };

  return {
    syncUsers: performSync,
    isLoading: isLoading || syncState.isSyncing,
    syncState,
    resetSyncState: () => setSyncState({ isSyncing: false }),
  };
};