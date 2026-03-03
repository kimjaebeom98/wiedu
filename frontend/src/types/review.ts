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

export interface CreateReviewRequest {
  rating: number;
  content: string;
}

export type SatisfactionLevel = 'very_satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very_dissatisfied';

export interface ReviewTag {
  id: string;
  label: string;
  selected: boolean;
}

// 멤버 간 리뷰
export interface StudyMemberToReview {
  userId: number;
  nickname: string;
  profileImage?: string;
  alreadyReviewed: boolean;
}

export interface CreateMemberReviewRequest {
  revieweeId: number;
  rating: number;
  content?: string;
}

export interface StudyMemberReview {
  id: number;
  reviewerId: number;
  reviewerNickname: string;
  reviewerProfileImage?: string;
  revieweeId: number;
  revieweeNickname: string;
  revieweeProfileImage?: string;
  studyTitle: string;
  rating: number;
  content?: string;
  createdAt: string;
}
