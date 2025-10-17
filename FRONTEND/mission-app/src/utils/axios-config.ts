import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { BASE_URL } from '@/config/api-config';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    accept: '*/*',
  },
});

let isRefreshing = false;
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const tokenData = localStorage.getItem('token');
    if (tokenData) {
      try {
        const { accessToken } = JSON.parse(tokenData);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error('Erreur parsing token:', error);
        localStorage.removeItem('token');
      }
    } else {
      console.warn('Aucun token trouvé pour la requête');
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${token}` };
            }
            return api(originalRequest);
          })
          .catch((err: AxiosError) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const tokenData = localStorage.getItem('token');
      if (tokenData) {
        try {
          const { refreshToken } = JSON.parse(tokenData);
          if (refreshToken) {
            const refreshResponse = await axios.post(
              `${BASE_URL}/api/Auth/refresh`,
              { refreshToken },
              {
                headers: {
                  'Content-Type': 'application/json',
                  accept: '*/*',
                },
              }
            );

            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.token;
            localStorage.setItem(
              'token',
              JSON.stringify({ accessToken, refreshToken: newRefreshToken })
            );

            processQueue(null, accessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            } else {
              originalRequest.headers = { Authorization: `Bearer ${accessToken}` };
            }
            return api(originalRequest);
          }
        } catch (refreshError) {
          const refreshErr = refreshError as AxiosError;
          processQueue(refreshErr, null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          
          if (typeof window !== 'undefined') {
            window.location.replace('/login'); 
            console.error('Token invalide : Redirection vers /login');
          } else {
            console.warn('Token invalide (serveur) : Pas de redirection possible');
          }
          return Promise.reject(refreshErr);
        }
      }

      isRefreshing = false;
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      if (typeof window !== 'undefined') {
        window.location.replace('/login'); 
        console.error('Token invalide : Redirection vers /login');
      } else {
        console.warn('Token invalide (serveur) : Pas de redirection possible');
      }
    }
    return Promise.reject(error);
  }
);

export default api;