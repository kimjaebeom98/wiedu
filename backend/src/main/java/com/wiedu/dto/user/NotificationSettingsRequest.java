package com.wiedu.dto.user;

import lombok.Getter;

/**
 * 알림 설정 업데이트 요청 DTO
 */
@Getter
public class NotificationSettingsRequest {
    private Boolean push;
    private Boolean chat;
    private Boolean study;
}
