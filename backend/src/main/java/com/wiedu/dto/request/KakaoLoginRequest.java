package com.wiedu.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * 카카오 로그인 요청 DTO
 * 프론트엔드에서 받은 인가 코드를 전달
 */
public record KakaoLoginRequest(
        @NotBlank(message = "인가 코드는 필수입니다")
        String code,

        String redirectUri
) {
}
