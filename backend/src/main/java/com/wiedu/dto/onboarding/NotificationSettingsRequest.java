package com.wiedu.dto.onboarding;

import lombok.Getter;

@Getter
public class NotificationSettingsRequest {
    private Boolean pushNotificationEnabled = true;
    private Boolean chatNotificationEnabled = true;
    private Boolean studyNotificationEnabled = true;
}
