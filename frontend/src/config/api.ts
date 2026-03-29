// API Configuration

// Railway URL (배포용)
const RAILWAY_URL = 'https://wiedu-production.up.railway.app';

// 개발용 API URL (환경변수 필수)
const DEV_API_URL = process.env.EXPO_PUBLIC_DEV_API_URL || 'http://localhost:8080';

// Use Railway in production, dev URL in development
export const getBaseURL = (): string => {
  if (__DEV__ === false) {
    return RAILWAY_URL;
  }
  return DEV_API_URL;
};
