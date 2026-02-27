package com.wiedu.dto.review;

import com.wiedu.domain.entity.StudyLeaderReview;

import java.time.LocalDateTime;

public record StudyLeaderReviewResponse(
        Long id,
        String reviewerNickname,
        String reviewerProfileImage,
        Integer rating,
        String content,
        String studyTitle,
        LocalDateTime createdAt
) {
    public static StudyLeaderReviewResponse from(StudyLeaderReview review) {
        return new StudyLeaderReviewResponse(
                review.getId(),
                review.getReviewer().getNickname(),
                review.getReviewer().getProfileImage(),
                review.getRating(),
                review.getContent(),
                review.getStudy().getTitle(),
                review.getCreatedAt()
        );
    }
}
