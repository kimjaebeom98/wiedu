package com.wiedu.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateReviewRequest(
        @NotNull(message = "평점은 필수입니다.")
        @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
        @Max(value = 5, message = "평점은 5점 이하이어야 합니다.")
        Integer rating,

        String content,

        @Size(max = 6, message = "태그는 최대 6개까지 선택 가능합니다.")
        List<String> tags
) {
}
