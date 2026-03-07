import axios, { AxiosError } from 'axios';

/**
 * API 에러 응답 타입
 */
interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

/**
 * API 에러 옵션
 */
interface ApiErrorOptions {
  defaultMessage: string;
  errorMessages?: {
    network?: string;
    unauthorized?: string;
    forbidden?: string;
    notFound?: string;
    conflict?: string;
    serverError?: string;
  };
}

/**
 * 기본 에러 메시지
 */
const DEFAULT_MESSAGES = {
  network: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
  unauthorized: '로그인이 필요합니다.',
  forbidden: '접근 권한이 없습니다.',
  notFound: '요청한 정보를 찾을 수 없습니다.',
  conflict: '이미 존재하는 데이터입니다.',
  serverError: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * Axios 에러를 사용자 친화적인 에러 메시지로 변환
 */
export const handleApiError = (error: unknown, options: ApiErrorOptions): never => {
  const { defaultMessage, errorMessages = {} } = options;
  const messages = { ...DEFAULT_MESSAGES, ...errorMessages };

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // 서버 응답이 있는 경우
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      const serverMessage = data?.message || data?.error;

      // HTTP 상태 코드별 처리
      switch (status) {
        case 401:
          throw new Error(messages.unauthorized);
        case 403:
          throw new Error(messages.forbidden);
        case 404:
          throw new Error(serverMessage || messages.notFound);
        case 409:
          throw new Error(serverMessage || messages.conflict);
        case 500:
        case 502:
        case 503:
          throw new Error(messages.serverError);
        default:
          // 서버에서 보낸 메시지가 있으면 사용
          throw new Error(serverMessage || defaultMessage);
      }
    }

    // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 오류)
    if (axiosError.request) {
      throw new Error(messages.network);
    }
  }

  // 그 외의 에러
  throw new Error(defaultMessage);
};

/**
 * API 호출을 래핑하여 에러 처리를 자동화
 */
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  options: ApiErrorOptions
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    // handleApiError always throws, but TypeScript needs explicit throw
    throw handleApiError(error, options);
  }
};
