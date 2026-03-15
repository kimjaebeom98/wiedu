import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import { StudyListResponse } from '../types/study';

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * 스터디 북마크 추가
 */
export const addBookmark = async (studyId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.post(`/api/studies/${studyId}/bookmark`);
    },
    {
      defaultMessage: '북마크 추가에 실패했습니다.',
      errorMessages: {
        conflict: '이미 북마크한 스터디입니다.',
      },
    }
  );
};

/**
 * 스터디 북마크 삭제
 */
export const removeBookmark = async (studyId: number): Promise<void> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      await client.delete(`/api/studies/${studyId}/bookmark`);
    },
    {
      defaultMessage: '북마크 삭제에 실패했습니다.',
    }
  );
};

/**
 * 스터디 북마크 토글 (추가/삭제)
 * @returns 토글 후 북마크 여부 (true: 북마크됨, false: 북마크 해제됨)
 */
export const toggleBookmark = async (studyId: number): Promise<boolean> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/bookmark/toggle`);
      return response.data;
    },
    {
      defaultMessage: '북마크 처리에 실패했습니다.',
    }
  );
};

/**
 * 북마크 여부 확인
 */
export const isBookmarked = async (studyId: number): Promise<boolean> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/bookmark`);
      return response.data;
    },
    {
      defaultMessage: '북마크 상태 확인에 실패했습니다.',
    }
  );
};

/**
 * 내 북마크 목록 조회
 */
export const getMyBookmarks = async (
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<StudyListResponse>> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get('/api/users/me/bookmarks', {
        params: { page, size },
      });
      return response.data;
    },
    {
      defaultMessage: '북마크 목록을 불러오는데 실패했습니다.',
    }
  );
};
