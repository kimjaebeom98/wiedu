package com.wiedu.dto.user;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.BadgeType;

/**
 * 근처 활동중인 멤버 응답 DTO
 */
public record NearbyMemberResponse(
        Long id,
        String nickname,
        String profileImage,
        String badge,       // 뱃지 이모지
        String badgeColor   // 뱃지 색상
) {
    /**
     * Entity → DTO 변환 (뱃지 포함)
     */
    public static NearbyMemberResponse from(User user, BadgeType badgeType) {
        return new NearbyMemberResponse(
                user.getId(),
                user.getNickname(),
                user.getProfileImage(),
                badgeType != null ? badgeType.getEmoji() : null,
                badgeType != null ? badgeType.getColor() : null
        );
    }
}
