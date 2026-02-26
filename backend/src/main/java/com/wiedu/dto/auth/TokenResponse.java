package com.wiedu.dto.auth;

import lombok.Builder;

@Builder
public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        Boolean onboardingCompleted
) {
    public static TokenResponse of(String accessToken, String refreshToken, long expiresIn, boolean onboardingCompleted) {
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn / 1000)
                .onboardingCompleted(onboardingCompleted)
                .build();
    }

    public static TokenResponse ofAccessToken(String accessToken, long expiresIn) {
        return TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn / 1000)
                .build();
    }
}
