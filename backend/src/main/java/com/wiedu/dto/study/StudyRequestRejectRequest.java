package com.wiedu.dto.study;

import jakarta.validation.constraints.Size;

/**
 * 스터디 가입 거절 요청 DTO
 */
public record StudyRequestRejectRequest(
        @Size(max = 500, message = "거절 사유는 500자 이하여야 합니다")
        String rejectReason
) {
}
