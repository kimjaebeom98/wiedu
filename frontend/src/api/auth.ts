import axios, { AxiosInstance } from 'axios';
import { LoginRequest, TokenResponse } from '../types/auth';
import { getBaseURL } from '../config/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (
  email: string,
  password: string
): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post<TokenResponse>('/api/auth/login', {
      email,
      password,
    } as LoginRequest);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        throw new Error(
          error.response.data?.message || '로그인에 실패했습니다.'
        );
      } else if (error.request) {
        // Request made but no response
        throw new Error('서버에 연결할 수 없습니다.');
      }
    }
    throw new Error('로그인 중 오류가 발생했습니다.');
  }
};

export { apiClient };
