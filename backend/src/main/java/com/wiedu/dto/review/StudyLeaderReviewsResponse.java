package com.wiedu.dto.review;

import java.util.List;

public record StudyLeaderReviewsResponse(
        List<StudyLeaderReviewResponse> reviews,
        Double averageRating,
        Long totalCount
) {
}
