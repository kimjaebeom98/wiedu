// Kakao OAuth - REST API Key (클라이언트에서 공개적으로 사용되는 키)
// EAS 빌드에서 환경 변수가 번들되지 않으므로 직접 설정
const KAKAO_REST_API_KEY = '891cfab43de70f0ea8f731792876fa0b';

// 환경 변수가 있으면 사용, 없으면 하드코딩된 값 사용
export const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || KAKAO_REST_API_KEY;

// 디버깅용 로그
console.log('[OAuth] KAKAO_CLIENT_ID:', KAKAO_CLIENT_ID ? 'set' : 'not set');
