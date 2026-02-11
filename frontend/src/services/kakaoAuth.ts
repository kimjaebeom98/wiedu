import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getBaseURL } from '../config/api';

// 카카오 OAuth 설정
const KAKAO_CLIENT_ID = '891cfab43de70f0ea8f731792876fa0b';

export interface KakaoLoginResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
  cancelled?: boolean;
}

/**
 * Base64 URL-safe 인코딩
 */
const base64UrlEncode = (str: string): string => {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const bytes = new TextEncoder().encode(str);

  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = bytes[i + 1] || 0;
    const b3 = bytes[i + 2] || 0;

    result += base64Chars[b1 >> 2];
    result += base64Chars[((b1 & 3) << 4) | (b2 >> 4)];
    result += i + 1 < bytes.length ? base64Chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    result += i + 2 < bytes.length ? base64Chars[b3 & 63] : '=';
  }

  return result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/**
 * 랜덤 세션 ID 생성
 */
const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 백엔드 OAuth 콜백 URL 생성
 */
const getBackendCallbackUrl = (): string => {
  const baseUrl = getBaseURL();
  return `${baseUrl}/api/auth/kakao/callback`;
};

/**
 * 앱 딥링크 URI 생성
 */
const getAppRedirectUri = (): string => {
  const uri = Linking.createURL('oauth/kakao');
  console.log('[Kakao] App Redirect URI:', uri);
  return uri;
};

/**
 * 백엔드에서 토큰 폴링
 */
const pollForTokens = async (
  sessionId: string,
  maxAttempts: number = 60,
  intervalMs: number = 1000
): Promise<KakaoLoginResult> => {
  const baseUrl = getBaseURL();
  const pollUrl = `${baseUrl}/api/auth/kakao/poll/${sessionId}`;

  console.log('[Kakao] Starting to poll for tokens:', pollUrl);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(pollUrl, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('[Kakao] Tokens received via polling!');
        return {
          success: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };
      } else if (response.status === 202) {
        // Still pending, continue polling
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      } else {
        console.error('[Kakao] Poll error:', response.status);
        return { success: false, error: `Poll failed with status ${response.status}` };
      }
    } catch (err: any) {
      console.error('[Kakao] Poll request error:', err);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return { success: false, error: 'Polling timeout' };
};

/**
 * 카카오 로그인 시작
 * openBrowserAsync + Linking + 폴링 조합으로 안정적인 OAuth 처리
 */
export const startKakaoLogin = async (): Promise<KakaoLoginResult> => {
  const backendCallbackUrl = getBackendCallbackUrl();
  const appRedirectUri = getAppRedirectUri();
  const sessionId = generateSessionId();

  // State에 세션 ID와 앱 리다이렉트 URI 포함
  const stateData = JSON.stringify({ sessionId, appRedirectUri });
  const state = base64UrlEncode(stateData);

  console.log('[Kakao] Session ID:', sessionId);
  console.log('[Kakao] Backend Callback URL:', backendCallbackUrl);
  console.log('[Kakao] State:', state);

  // 카카오 인증 URL 생성
  const authUrl =
    `https://kauth.kakao.com/oauth/authorize?` +
    `client_id=${KAKAO_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(backendCallbackUrl)}` +
    `&response_type=code` +
    `&state=${state}` +
    `&scope=profile_nickname,profile_image,account_email`;

  console.log('[Kakao] Opening auth URL...');

  return new Promise((resolve) => {
    let resolved = false;
    let pollingStarted = false;

    // 딥링크 이벤트 리스너 설정
    const handleDeepLink = (event: { url: string }) => {
      console.log('[Kakao] Deep link received:', event.url);

      if (resolved) return;

      try {
        // OAuth 콜백 경로 확인
        if (!event.url.includes('oauth/kakao')) {
          console.log('[Kakao] Not an OAuth callback, ignoring');
          return;
        }

        const url = new URL(event.url);
        const accessToken = url.searchParams.get('accessToken');
        const refreshToken = url.searchParams.get('refreshToken');
        const expiresIn = url.searchParams.get('expiresIn');
        const error = url.searchParams.get('error');

        resolved = true;
        subscription.remove();
        WebBrowser.dismissBrowser();

        if (error) {
          console.error('[Kakao] OAuth error:', error);
          resolve({ success: false, error });
          return;
        }

        if (accessToken && refreshToken) {
          console.log('[Kakao] Login successful via deep link!');
          resolve({
            success: true,
            accessToken,
            refreshToken,
            expiresIn: expiresIn ? parseInt(expiresIn, 10) : undefined,
          });
        } else {
          console.error('[Kakao] Missing tokens in deep link');
          resolve({ success: false, error: 'Missing tokens in callback' });
        }
      } catch (err: any) {
        console.error('[Kakao] Error parsing deep link:', err);
        if (!resolved) {
          resolved = true;
          subscription.remove();
          resolve({ success: false, error: err.message });
        }
      }
    };

    // Linking 이벤트 구독
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 브라우저 열기 (openBrowserAsync 사용 - 리다이렉트 감지 안함)
    const openBrowser = async () => {
      try {
        // 브라우저 열기
        const result = await WebBrowser.openBrowserAsync(authUrl, {
          showInRecents: true,
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        });

        console.log('[Kakao] Browser closed with result:', result.type);

        // 브라우저가 닫혔을 때
        if (!resolved) {
          // 딥링크가 오지 않았다면 폴링 시작
          if (!pollingStarted) {
            pollingStarted = true;
            console.log('[Kakao] Browser closed, starting polling...');

            // 잠시 대기 후 폴링 시작 (백엔드 처리 시간 고려)
            await new Promise((r) => setTimeout(r, 1000));

            if (!resolved) {
              const pollResult = await pollForTokens(sessionId, 30, 1000); // 30초 동안 폴링
              if (!resolved) {
                resolved = true;
                subscription.remove();
                resolve(pollResult);
              }
            }
          }
        }
      } catch (err: any) {
        if (!resolved) {
          resolved = true;
          subscription.remove();
          console.error('[Kakao] Browser error:', err);
          resolve({ success: false, error: err.message });
        }
      }
    };

    openBrowser();

    // 전체 타임아웃 (2분)
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        subscription.remove();
        WebBrowser.dismissBrowser();
        resolve({ success: false, error: 'Authentication timeout' });
      }
    }, 120000);
  });
};
