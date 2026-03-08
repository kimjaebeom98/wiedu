package com.wiedu.dto.notification;

import com.wiedu.domain.entity.Notification;
import com.wiedu.domain.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    NotificationType type,
    String title,
    String message,
    Long targetId,
    String targetType,
    boolean isRead,
    LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getTargetId(),
            notification.getTargetType(),
            notification.isRead(),
            notification.getCreatedAt()
        );
    }
}
