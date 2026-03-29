import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getBaseURL } from '../config/api';
import { base64UrlEncode } from '../utils/base64';
import { generateSessionId } from '../utils/uuid';

export interface KakaoLoginResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  onboardingCompleted?: boolean;
  error?: string;
  cancelled?: boolean;
}

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
  return Linking.createURL('oauth/kakao');
};

/**
 * 백엔드에서 인가 URL 가져오기 (API Key 보안)
 */
const getAuthorizationUrl = async (state: string): Promise<string> => {
  const baseUrl = getBaseURL();
  const response = await fetch(
    `${baseUrl}/api/auth/kakao/authorize?state=${encodeURIComponent(state)}`,
    {
      headers: { 'ngrok-skip-browser-warning': 'true' },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get authorization URL: ${response.status}`);
  }

  const data = await response.json();
  return data.authUrl;
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

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(pollUrl, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
      });

      if (response.status === 200) {
        const data = await response.json();
        return {
          success: true,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
          onboardingCompleted: data.onboardingCompleted,
        };
      } else if (response.status === 202) {
        // Still pending, continue polling
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      } else {
        console.error('[Kakao] Poll error:', response.status);
        return { success: false, error: '카카오 로그인 처리 중 오류가 발생했습니다' };
      }
    } catch (err: any) {
      console.error('[Kakao] Poll request error:', err);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return { success: false, error: '카카오 로그인 응답 대기 시간이 초과되었습니다' };
};

/**
 * 카카오 로그인 시작
 * openBrowserAsync + Linking + 폴링 조합으로 안정적인 OAuth 처리
 */
export const startKakaoLogin = async (): Promise<KakaoLoginResult> => {
  const appRedirectUri = getAppRedirectUri();
  const sessionId = generateSessionId();

  // State에 세션 ID와 앱 리다이렉트 URI 포함
  const stateData = JSON.stringify({ sessionId, appRedirectUri });
  const state = base64UrlEncode(stateData);

  // 백엔드에서 인가 URL 가져오기 (API Key 보안)
  let authUrl: string;
  try {
    authUrl = await getAuthorizationUrl(state);
  } catch (error: any) {
    console.error('[Kakao] Failed to get auth URL:', error);
    return { success: false, error: '인가 URL을 가져오는데 실패했습니다.' };
  }

  return new Promise((resolve) => {
    let resolved = false;
    let pollingStarted = false;

    // 딥링크 이벤트 리스너 설정
    const handleDeepLink = (event: { url: string }) => {
      if (resolved) return;

      try {
        // OAuth 콜백 경로 확인
        if (!event.url.includes('oauth/kakao')) {
          return;
        }

        const url = new URL(event.url);
        const accessToken = url.searchParams.get('accessToken');
        const refreshToken = url.searchParams.get('refreshToken');
        const expiresIn = url.searchParams.get('expiresIn');
        const onboardingCompletedStr = url.searchParams.get('onboardingCompleted');
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
          resolve({
            success: true,
            accessToken,
            refreshToken,
            expiresIn: expiresIn ? parseInt(expiresIn, 10) : undefined,
            onboardingCompleted: onboardingCompletedStr === 'true',
          });
        } else {
          console.error('[Kakao] Missing tokens in deep link');
          resolve({ success: false, error: '로그인 정보를 받아오지 못했습니다' });
        }
      } catch (err: any) {
        console.error('[Kakao] Error parsing deep link:', err);
        if (!resolved) {
          resolved = true;
          subscription.remove();
          resolve({ success: false, error: '로그인 응답 처리 중 오류가 발생했습니다' });
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

        // 브라우저가 닫혔을 때
        if (!resolved) {
          // 딥링크가 오지 않았다면 폴링 시작
          if (!pollingStarted) {
            pollingStarted = true;

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
          resolve({ success: false, error: '카카오 로그인 창을 열 수 없습니다' });
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
        resolve({ success: false, error: '인증 시간이 초과되었습니다. 다시 시도해주세요' });
      }
    }, 120000);
  });
};
