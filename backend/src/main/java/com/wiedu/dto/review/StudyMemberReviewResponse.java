package com.wiedu.dto.review;

import com.wiedu.domain.entity.StudyMemberReview;

import java.time.LocalDateTime;

public record StudyMemberReviewResponse(
    Long id,
    Long reviewerId,
    String reviewerNickname,
    String reviewerProfileImage,
    Long revieweeId,
    String revieweeNickname,
    String revieweeProfileImage,
    String studyTitle,
    Integer rating,
    String content,
    LocalDateTime createdAt
) {
    public static StudyMemberReviewResponse from(StudyMemberReview review) {
        return new StudyMemberReviewResponse(
            review.getId(),
            review.getReviewer().getId(),
            review.getReviewer().getNickname(),
            review.getReviewer().getProfileImage(),
            review.getReviewee().getId(),
            review.getReviewee().getNickname(),
            review.getReviewee().getProfileImage(),
            review.getStudy().getTitle(),
            review.getRating(),
            review.getContent(),
            review.getCreatedAt()
        );
    }
}
