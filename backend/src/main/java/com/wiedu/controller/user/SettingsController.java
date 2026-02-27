package com.wiedu.controller.user;

import com.wiedu.dto.user.NotificationSettingsRequest;
import com.wiedu.dto.user.NotificationSettingsResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.user.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 설정 API 컨트롤러 (알림 설정, 회원 탈퇴)
 */
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    /**
     * 알림 설정 조회
     * GET /api/users/me/settings/notifications
     */
    @GetMapping("/settings/notifications")
    public ResponseEntity<NotificationSettingsResponse> getNotificationSettings() {
        Long userId = SecurityUtils.getCurrentUserId();
        NotificationSettingsResponse response = settingsService.getNotificationSettings(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 알림 설정 업데이트
     * PUT /api/users/me/settings/notifications
     */
    @PutMapping("/settings/notifications")
    public ResponseEntity<NotificationSettingsResponse> updateNotificationSettings(
            @RequestBody NotificationSettingsRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        NotificationSettingsResponse response = settingsService.updateNotificationSettings(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 회원 탈퇴
     * DELETE /api/users/me
     */
    @DeleteMapping
    public ResponseEntity<Void> withdraw() {
        Long userId = SecurityUtils.getCurrentUserId();
        settingsService.withdraw(userId);
        return ResponseEntity.noContent().build();
    }
}
