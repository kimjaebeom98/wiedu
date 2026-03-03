package com.wiedu.dto.review;

/**
 * 리뷰 대상 멤버 정보
 */
public record StudyMemberToReviewResponse(
    Long userId,
    String nickname,
    String profileImage,
    boolean alreadyReviewed
) {}
