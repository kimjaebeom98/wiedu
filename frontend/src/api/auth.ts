import axios, { AxiosInstance } from 'axios';
import { LoginRequest, SignupRequest, TokenResponse, UserResponse } from '../types/auth';
import { getBaseURL } from '../config/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const signup = async (
  email: string,
  password: string
): Promise<UserResponse> => {
  try {
    const response = await apiClient.post<UserResponse>('/api/users/signup', {
      email,
      password,
    } as SignupRequest);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const message = error.response.data?.message;
        if (error.response.status === 409 || message?.includes('이메일')) {
          throw new Error('이미 가입된 이메일입니다.');
        }
        throw new Error(message || '회원가입에 실패했습니다.');
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
    }
    throw new Error('회원가입 중 오류가 발생했습니다.');
  }
};

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
        throw new Error(
          error.response.data?.message || '로그인에 실패했습니다.'
        );
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
    }
    throw new Error('로그인 중 오류가 발생했습니다.');
  }
};

export { apiClient };
