// API Configuration
import Constants from 'expo-constants';

// Railway URL (production)
const RAILWAY_URL = 'https://wiedu-production.up.railway.app';

// Development URL from environment variable or fallback to localhost
const DEV_API_URL = Constants.expoConfig?.extra?.devApiUrl || 'http://localhost:8080';

// Use Railway in production, DEV_API_URL in development
export const getBaseURL = (): string => {
  if (__DEV__ === false) {
    return RAILWAY_URL;
  }
  return DEV_API_URL;
};
