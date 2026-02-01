package com.wiedu.dto.request;

import jakarta.validation.constraints.Size;

/**
 * 사용자 정보 수정 요청 DTO
 */
public record UserUpdateRequest(
        @Size(min = 2, max = 20, message = "닉네임은 2~20자 사이여야 합니다")
        String nickname,

        String profileImage
) {
}
