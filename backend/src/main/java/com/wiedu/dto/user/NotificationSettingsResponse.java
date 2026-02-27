package com.wiedu.dto.user;

import com.wiedu.domain.entity.User;
import lombok.Builder;

/**
 * 알림 설정 조회 응답 DTO
 */
@Builder
public record NotificationSettingsResponse(
        boolean push,
        boolean chat,
        boolean study
) {
    public static NotificationSettingsResponse from(User user) {
        return NotificationSettingsResponse.builder()
                .push(user.isPushNotificationEnabled())
                .chat(user.isChatNotificationEnabled())
                .study(user.isStudyNotificationEnabled())
                .build();
    }
}
