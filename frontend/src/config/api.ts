// API Configuration

// Railway URL (배포 후 실제 URL로 변경)
const RAILWAY_URL = 'https://wiedu-backend.up.railway.app'; // TODO: Railway 배포 후 실제 URL로 변경

// ngrok URL for local development
const NGROK_URL = 'https://3662-121-140-123-64.ngrok-free.app';

// Use Railway in production, ngrok in development
export const getBaseURL = (): string => {
  if (__DEV__ === false) {
    return RAILWAY_URL;
  }
  return NGROK_URL;
};

// Debug: Log the selected URL
console.log('[API] Base URL:', getBaseURL());
