// API Configuration

// Railway URL (배포 후 실제 URL로 변경)
const RAILWAY_URL = 'https://wiedu-production.up.railway.app';

// ngrok URL for local development
const NGROK_URL = 'https://f72a-121-140-123-64.ngrok-free.app';

// Use Railway in production, ngrok/localhost in development
export const getBaseURL = (): string => {
  if (__DEV__ === false) {
    return RAILWAY_URL;
  }
  // 실기기 테스트: ngrok URL 사용
  return NGROK_URL;
  // iOS 시뮬레이터: return 'http://localhost:8080';
  // Android 에뮬레이터: return 'http://10.0.2.2:8080';
};

// Debug: Log the selected URL
console.log('[API] Base URL:', getBaseURL());
