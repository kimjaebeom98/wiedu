package com.wiedu.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 회차 취소 요청
 */
public record SessionCancellationRequest(
    @NotBlank(message = "취소 사유를 입력해주세요.")
    @Size(max = 500, message = "취소 사유는 500자 이내로 입력해주세요.")
    String reason
) {}
