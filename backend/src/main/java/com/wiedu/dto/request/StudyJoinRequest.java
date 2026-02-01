package com.wiedu.dto.request;

import jakarta.validation.constraints.Size;

/**
 * 스터디 가입 신청 요청 DTO
 */
public record StudyJoinRequest(
        @Size(max = 500, message = "자기소개는 500자 이하여야 합니다")
        String message
) {
}
