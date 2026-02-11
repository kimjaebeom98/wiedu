package com.wiedu.dto.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.UserStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 사용자 응답 DTO
 * - 비밀번호 제외
 */
public record UserResponse(
        Long id,
        String email,
        String nickname,
        String profileImage,
        BigDecimal temperature,
        UserStatus status,
        boolean emailVerified,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt
) {
    // Entity → DTO 변환 정적 팩토리 메서드
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage(),
                user.getTemperature(),
                user.getStatus(),
                user.isEmailVerified(),
                user.getLastLoginAt(),
                user.getCreatedAt()
        );
    }
}
