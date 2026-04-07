package com.wiedu.dto.review;

import com.wiedu.domain.entity.StudyMemberReview;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

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
    List<String> tags,
    LocalDateTime createdAt
) {
    public static StudyMemberReviewResponse from(StudyMemberReview review) {
        List<String> tagList = review.getTags() != null && !review.getTags().isEmpty()
            ? Arrays.asList(review.getTags().split(","))
            : Collections.emptyList();

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
            tagList,
            review.getCreatedAt()
        );
    }
}
