package com.wiedu.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 카카오 사용자 정보 응답 DTO
 */
public record KakaoUserResponse(
        Long id,

        @JsonProperty("kakao_account")
        KakaoAccount kakaoAccount
) {
    public record KakaoAccount(
            String email,
            Profile profile,

            @JsonProperty("is_email_valid")
            Boolean isEmailValid,

            @JsonProperty("is_email_verified")
            Boolean isEmailVerified
    ) {
        public record Profile(
                String nickname,

                @JsonProperty("profile_image_url")
                String profileImageUrl,

                @JsonProperty("thumbnail_image_url")
                String thumbnailImageUrl
        ) {
        }
    }

    public String getEmail() {
        return kakaoAccount != null ? kakaoAccount.email() : null;
    }

    public String getNickname() {
        if (kakaoAccount != null && kakaoAccount.profile() != null) {
            return kakaoAccount.profile().nickname();
        }
        return null;
    }

    public String getProfileImage() {
        if (kakaoAccount != null && kakaoAccount.profile() != null) {
            return kakaoAccount.profile().profileImageUrl();
        }
        return null;
    }
}
