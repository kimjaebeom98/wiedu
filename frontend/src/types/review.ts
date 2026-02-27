export interface StudyLeaderReview {
  id: number;
  reviewerNickname: string;
  reviewerProfileImage?: string;
  rating: number;
  content: string;
  studyTitle: string;
  createdAt: string;
}

export interface StudyLeaderReviewsResponse {
  reviews: StudyLeaderReview[];
  averageRating: number | null;
  totalCount: number;
}
