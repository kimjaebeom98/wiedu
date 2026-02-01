package com.wiedu.dto.request;

import com.wiedu.domain.enums.StudyCategory;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * 스터디 생성 요청 DTO
 */
public record StudyCreateRequest(
        @NotBlank(message = "스터디 제목은 필수입니다")
        @Size(max = 100, message = "제목은 100자 이하여야 합니다")
        String title,

        @Size(max = 2000, message = "설명은 2000자 이하여야 합니다")
        String description,

        @NotNull(message = "카테고리는 필수입니다")
        StudyCategory category,

        @NotNull(message = "최대 인원은 필수입니다")
        @Min(value = 2, message = "최소 2명 이상이어야 합니다")
        @Max(value = 50, message = "최대 50명까지 가능합니다")
        Integer maxMembers,

        String region,

        String detailedLocation,

        boolean online,

        String schedule,

        LocalDateTime startDate,

        LocalDateTime endDate
) {
}
