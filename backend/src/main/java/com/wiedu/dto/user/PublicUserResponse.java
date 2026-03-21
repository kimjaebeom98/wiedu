package com.wiedu.dto.user;

import com.wiedu.domain.entity.User;

import java.math.BigDecimal;

/**
 * 공개용 사용자 응답 DTO
 * - 다른 사용자 조회 시 사용
 * - 민감 정보(email, status, emailVerified, lastLoginAt) 제외
 */
public record PublicUserResponse(
        Long id,
        String nickname,
        String profileImage,
        String bio,
        BigDecimal temperature
) {
    public static PublicUserResponse from(User user) {
        return new PublicUserResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImage(),
                user.getBio(),
                user.getTemperature()
        );
    }
}
