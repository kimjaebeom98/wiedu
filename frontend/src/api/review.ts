import { getAuthClient } from './client';
import { StudyLeaderReviewsResponse } from '../types/review';

export const getLeaderReviews = async (userId: number): Promise<StudyLeaderReviewsResponse> => {
  const client = getAuthClient();
  const response = await client.get(`/api/users/${userId}/reviews`);
  return response.data;
};
