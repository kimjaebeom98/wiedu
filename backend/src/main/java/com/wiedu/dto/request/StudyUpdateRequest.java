package com.wiedu.dto.request;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * 스터디 수정 요청 DTO
 */
public record StudyUpdateRequest(
        @Size(max = 100, message = "제목은 100자 이하여야 합니다")
        String title,

        @Size(max = 2000, message = "설명은 2000자 이하여야 합니다")
        String description,

        String region,

        String detailedLocation,

        String schedule,

        LocalDateTime startDate,

        LocalDateTime endDate
) {
}
