package com.wiedu.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateMemberReviewRequest(
    @NotNull(message = "리뷰 대상자 ID는 필수입니다.")
    Long revieweeId,

    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.")
    Integer rating,

    String content
) {}
