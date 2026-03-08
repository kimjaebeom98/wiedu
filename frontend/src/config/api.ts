// API Configuration

// Railway URL (배포용)
const RAILWAY_URL = 'https://wiedu-production.up.railway.app';

// 개발용 API URL (환경변수 또는 기본값)
const DEV_API_URL =
  process.env.EXPO_PUBLIC_DEV_API_URL || 'https://300f-121-140-123-64.ngrok-free.app';

// Use Railway in production, dev URL in development
export const getBaseURL = (): string => {
  if (__DEV__ === false) {
    return RAILWAY_URL;
  }
  return DEV_API_URL;
};
