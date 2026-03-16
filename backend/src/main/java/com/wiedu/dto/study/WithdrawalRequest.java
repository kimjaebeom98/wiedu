package com.wiedu.dto.study;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 스터디 탈퇴 신청 요청 DTO
 */
public record WithdrawalRequest(
        @NotBlank(message = "탈퇴 사유를 입력해주세요.")
        @Size(max = 500, message = "탈퇴 사유는 500자 이내로 입력해주세요.")
        String reason
) {
}
