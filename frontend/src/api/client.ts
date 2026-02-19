import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getBaseURL } from '../config/api';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '../storage/token';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Create auth client with automatic token refresh
export const createAuthClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add token to headers
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle 401 and refresh token
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If 401 and not already retrying
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue this request until token is refreshed
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(client(originalRequest));
              },
              reject: (err: Error) => reject(err),
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          // Call refresh endpoint
          const response = await axios.post(`${getBaseURL()}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          // Keep old refresh token if new one is not provided
          await saveTokens(accessToken, newRefreshToken || refreshToken);

          processQueue(null, accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(new Error('Token refresh failed'), null);
          await clearTokens();
          // The app should handle navigation to login
          throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Singleton instance
let authClientInstance: AxiosInstance | null = null;

export const getAuthClient = (): AxiosInstance => {
  if (!authClientInstance) {
    authClientInstance = createAuthClient();
  }
  return authClientInstance;
};

// Public client for unauthenticated requests
export const getPublicClient = (): AxiosInstance => {
  return axios.create({
    baseURL: getBaseURL(),
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
