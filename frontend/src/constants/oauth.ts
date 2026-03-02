// Kakao OAuth - 환경 변수에서 로드
export const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '';

// 환경 변수 누락 경고
if (!KAKAO_CLIENT_ID) {
  console.warn('[OAuth] EXPO_PUBLIC_KAKAO_REST_API_KEY is not set in .env');
}
