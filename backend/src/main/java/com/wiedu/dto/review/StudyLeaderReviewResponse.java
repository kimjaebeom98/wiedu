package com.wiedu.dto.review;

import com.wiedu.domain.entity.StudyLeaderReview;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public record StudyLeaderReviewResponse(
        Long id,
        String reviewerNickname,
        String reviewerProfileImage,
        String leaderNickname,
        String leaderProfileImage,
        Integer rating,
        String content,
        List<String> tags,
        String studyTitle,
        LocalDateTime createdAt
) {
    public static StudyLeaderReviewResponse from(StudyLeaderReview review) {
        List<String> tagList = review.getTags() != null && !review.getTags().isEmpty()
                ? Arrays.asList(review.getTags().split(","))
                : Collections.emptyList();

        return new StudyLeaderReviewResponse(
                review.getId(),
                review.getReviewer().getNickname(),
                review.getReviewer().getProfileImage(),
                review.getLeader().getNickname(),
                review.getLeader().getProfileImage(),
                review.getRating(),
                review.getContent(),
                tagList,
                review.getStudy().getTitle(),
                review.getCreatedAt()
        );
    }
}
