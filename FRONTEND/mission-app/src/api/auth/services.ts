import { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config/api-config';

// Interfaces (inchangées, exportées pour réutilisation)
export interface User {
  userId: string;
  email: string;
  matricule: string;
  name: string;
  department: string;
  userType: string;
  roles: string[];
}

export interface Token {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  status: string;
  user: User;
  token: Token;
  type?: string;
  message?: string;
}

export interface AuthError {
  message: string;
  type: string;
  details: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SuccessResponse {
  isOpen: boolean;
  type: string;
  message: string;
  user?: User;
  token?: Token;
}

export interface LoadingState {
  login?: boolean;
  logout?: boolean;
}

// Hook pour la connexion (sans TanStack Query)
export const useLoginUser = (
  onSuccess: (data: SuccessResponse) => void,
  onError: (error: AuthError) => void
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${BASE_URL}/api/Auth`, {
        username: credentials.username,
        password: credentials.password,
      }, {
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      // Vérification et traitement de la réponse
      if (!data.user?.userId || !data.token) {
        throw new Error('Réponse API invalide : utilisateur ou token manquant');
      }

      const userData: User = {
        userId: data.user.userId,
        email: data.user.email,
        matricule: data.user.matricule,
        name: data.user.name,
        department: data.user.department,
        userType: data.user.userType,
        roles: data.user.roles || [],
      };

      const tokenData: Token = {
        accessToken: data.token.accessToken,
        refreshToken: data.token.refreshToken,
        expiresIn: data.token.expiresIn,
      };

      // Stockage dans localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', JSON.stringify(tokenData));

      onSuccess({
        isOpen: true,
        type: data.type || 'success',
        message: data.message || 'Connexion réussie',
        user: userData,
        token: tokenData,
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      let errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
      let details = 'Erreur inconnue';

      // Extraction d'erreur Axios si disponible
      if (axios.isAxiosError(error) && error.response?.data) {
        const { message, details: errorDetails } = error.response.data as { message?: string; details?: string };
        errorMessage = message || errorMessage;
        details = errorDetails || error.message || details;
      } else if (error instanceof Error) {
        details = error.message;
      }

      onError({
        message: errorMessage,
        type: 'error',
        details,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};

// Hook pour la déconnexion (similaire, sans TanStack Query)
export const useLogoutUser = (
  onSuccess: (data: SuccessResponse) => void,
  onError: (error: AuthError) => void
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const logout = async () => {
    try {
      setIsLoading(true);

      const tokenData = localStorage.getItem('token');
      if (!tokenData) {
        throw new Error('Aucun token trouvé pour la déconnexion');
      }

      const token = JSON.parse(tokenData)?.accessToken || '';
      if (!token) {
        throw new Error('Token d\'accès invalide');
      }

      // Appel API pour la déconnexion
      await axios.post(`${BASE_URL}/api/Auth/logout`, {}, {
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Suppression du localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      onSuccess({
        isOpen: true,
        type: 'success',
        message: 'Déconnexion réussie',
      });

      // Redirection vers /login après succès
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      let errorMessage = 'Erreur lors de la déconnexion';
      let details = 'Erreur inconnue';

      if (axios.isAxiosError(error) && error.response?.data) {
        const { message, details: errorDetails } = error.response.data as { message?: string; details?: string };
        errorMessage = message || errorMessage;
        details = errorDetails || error.message || details;
      } else if (error instanceof Error) {
        details = error.message;
      }

      onError({
        message: errorMessage,
        type: 'error',
        details,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { logout, isLoading };
};