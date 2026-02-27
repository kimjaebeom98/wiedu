package com.wiedu.service.user;

import com.wiedu.domain.entity.User;
import com.wiedu.dto.user.NotificationSettingsRequest;
import com.wiedu.dto.user.NotificationSettingsResponse;
import com.wiedu.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 설정 서비스 (알림 설정, 회원 탈퇴)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettingsService {

    private final UserService userService;
    private final UserRepository userRepository;

    /**
     * 알림 설정 조회
     */
    public NotificationSettingsResponse getNotificationSettings(Long userId) {
        User user = userService.findUserEntityById(userId);
        return NotificationSettingsResponse.from(user);
    }

    /**
     * 알림 설정 업데이트
     */
    @Transactional
    public NotificationSettingsResponse updateNotificationSettings(Long userId, NotificationSettingsRequest request) {
        User user = userService.findUserEntityById(userId);

        boolean push = request.getPush() != null ? request.getPush() : user.isPushNotificationEnabled();
        boolean chat = request.getChat() != null ? request.getChat() : user.isChatNotificationEnabled();
        boolean study = request.getStudy() != null ? request.getStudy() : user.isStudyNotificationEnabled();

        user.updateNotificationSettings(push, chat, study);
        return NotificationSettingsResponse.from(user);
    }

    /**
     * 회원 탈퇴 (soft delete)
     */
    @Transactional
    public void withdraw(Long userId) {
        User user = userService.findUserEntityById(userId);
        user.withdraw();
    }
}
