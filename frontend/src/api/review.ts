import { getAuthClient } from './client';
import {
  StudyLeaderReviewsResponse,
  StudyLeaderReview,
  CreateReviewRequest,
  StudyMemberToReview,
  CreateMemberReviewRequest,
  StudyMemberReview,
} from '../types/review';

export const getLeaderReviews = async (userId: number): Promise<StudyLeaderReviewsResponse> => {
  const client = getAuthClient();
  const response = await client.get(`/api/users/${userId}/reviews`);
  return response.data;
};

export const createReview = async (studyId: number, request: CreateReviewRequest): Promise<StudyLeaderReview> => {
  const client = getAuthClient();
  const response = await client.post(`/api/studies/${studyId}/reviews`, request);
  return response.data;
};

// 멤버 간 리뷰 API
export const getMembersToReview = async (studyId: number): Promise<StudyMemberToReview[]> => {
  const client = getAuthClient();
  const response = await client.get(`/api/studies/${studyId}/members/to-review`);
  return response.data;
};

export const createMemberReview = async (studyId: number, request: CreateMemberReviewRequest): Promise<StudyMemberReview> => {
  const client = getAuthClient();
  const response = await client.post(`/api/studies/${studyId}/member-reviews`, request);
  return response.data;
};

export const getMemberReviews = async (userId: number): Promise<StudyMemberReview[]> => {
  const client = getAuthClient();
  const response = await client.get(`/api/users/${userId}/member-reviews`);
  return response.data;
};
