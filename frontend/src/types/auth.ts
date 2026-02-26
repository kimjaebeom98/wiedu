export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  onboardingCompleted?: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  temperature: number;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
}
