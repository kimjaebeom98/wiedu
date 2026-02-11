// API Configuration
// ngrok URL for development (bypasses network restrictions)
const NGROK_URL = 'https://3662-121-140-123-64.ngrok-free.app';

// Production URL
const PRODUCTION_URL = 'https://api.wiedu.com';

// Use ngrok in development, production URL in production
export const getBaseURL = (): string => {
  if (__DEV__ === false) {
    return PRODUCTION_URL;
  }
  return NGROK_URL;
};

// Debug: Log the selected URL
console.log('[API] Base URL:', getBaseURL());
