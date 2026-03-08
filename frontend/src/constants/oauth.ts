// Kakao OAuth - API Key는 백엔드에서 관리
// 클라이언트에서는 백엔드 /api/auth/kakao/authorize 엔드포인트를 통해 인가 URL을 받아옴
// 이 파일은 하위 호환성을 위해 유지하지만, 새로운 코드에서는 사용하지 않음

// 레거시 지원용 (향후 제거 예정)
export const KAKAO_CLIENT_ID = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY || '';
