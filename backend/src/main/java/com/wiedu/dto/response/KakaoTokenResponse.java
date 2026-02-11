package com.wiedu.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 카카오 토큰 응답 DTO
 */
public record KakaoTokenResponse(
        @JsonProperty("access_token")
        String accessToken,

        @JsonProperty("token_type")
        String tokenType,

        @JsonProperty("refresh_token")
        String refreshToken,

        @JsonProperty("expires_in")
        Integer expiresIn,

        @JsonProperty("refresh_token_expires_in")
        Integer refreshTokenExpiresIn,

        String scope
) {
}
