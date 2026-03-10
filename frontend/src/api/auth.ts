import axios from 'axios';
import { LoginRequest, SignupRequest, TokenResponse, UserResponse } from '../types/auth';
import { getPublicClient } from './client';

const apiClient = getPublicClient();

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

/**
 * 이메일 인증 코드 발송
 */
export const sendVerificationCode = async (email: string): Promise<void> => {
  try {
    await apiClient.post('/api/email/send-code', { email });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || '인증 코드 발송에 실패했습니다.'
        );
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
    }
    throw new Error('인증 코드 발송 중 오류가 발생했습니다.');
  }
};

/**
 * 이메일 인증 코드 확인
 */
export const verifyEmailCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const response = await apiClient.post<{ verified: boolean; message: string }>(
      '/api/email/verify-code',
      { email, code }
    );
    return response.data.verified;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || '인증 코드 확인에 실패했습니다.'
        );
      } else if (error.request) {
        throw new Error('서버에 연결할 수 없습니다.');
      }
    }
    throw new Error('인증 코드 확인 중 오류가 발생했습니다.');
  }
};

/**
 * 로그아웃 - 서버에 토큰 무효화 요청
 */
export const logout = async (refreshToken: string): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout', { refreshToken });
  } catch (error) {
    // 로그아웃 실패해도 로컬 토큰은 삭제해야 함
    console.warn('Server logout failed, clearing local tokens anyway');
  }
};

export { apiClient };
