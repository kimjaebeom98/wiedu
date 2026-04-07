import { getAuthClient } from './client';
import { withErrorHandling } from './apiError';
import {
  StudyLeaderReviewsResponse,
  StudyLeaderReview,
  CreateReviewRequest,
  StudyMemberToReview,
  CreateMemberReviewRequest,
  StudyMemberReview,
} from '../types/review';

export const getLeaderReviews = async (userId: number): Promise<StudyLeaderReviewsResponse> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/users/${userId}/reviews`);
      return response.data;
    },
    { defaultMessage: '리더 리뷰를 불러오는데 실패했습니다.' }
  );
};

export const createReview = async (studyId: number, request: CreateReviewRequest): Promise<StudyLeaderReview> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/reviews`, request);
      return response.data;
    },
    {
      defaultMessage: '리뷰 작성에 실패했습니다.',
      errorMessages: {
        conflict: '이미 리뷰를 작성하셨습니다.',
      },
    }
  );
};

// Check if user has already reviewed the study leader
export const checkLeaderReviewExists = async (studyId: number): Promise<boolean> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/reviews/check`);
      return response.data.hasReviewed;
    },
    { defaultMessage: '리뷰 확인에 실패했습니다.' }
  );
};

export const getMembersToReview = async (studyId: number): Promise<StudyMemberToReview[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/studies/${studyId}/members/to-review`);
      return response.data;
    },
    { defaultMessage: '리뷰 대상 멤버를 불러오는데 실패했습니다.' }
  );
};

export const createMemberReview = async (studyId: number, request: CreateMemberReviewRequest): Promise<StudyMemberReview> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.post(`/api/studies/${studyId}/member-reviews`, request);
      return response.data;
    },
    {
      defaultMessage: '멤버 리뷰 작성에 실패했습니다.',
      errorMessages: {
        conflict: '이미 해당 멤버에게 리뷰를 작성하셨습니다.',
      },
    }
  );
};

export const getMemberReviews = async (userId: number): Promise<StudyMemberReview[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get(`/api/users/${userId}/member-reviews`);
      return response.data;
    },
    { defaultMessage: '멤버 리뷰를 불러오는데 실패했습니다.' }
  );
};

// 내가 작성한 스터디장 리뷰 목록
export const getLeaderReviewsWrittenByMe = async (): Promise<StudyLeaderReview[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get('/api/users/me/reviews/written');
      return response.data;
    },
    { defaultMessage: '작성한 리뷰를 불러오는데 실패했습니다.' }
  );
};

// 내가 작성한 멤버 리뷰 목록
export const getMemberReviewsWrittenByMe = async (): Promise<StudyMemberReview[]> => {
  return withErrorHandling(
    async () => {
      const client = getAuthClient();
      const response = await client.get('/api/users/me/member-reviews/written');
      return response.data;
    },
    { defaultMessage: '작성한 멤버 리뷰를 불러오는데 실패했습니다.' }
  );
};
