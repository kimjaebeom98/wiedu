package com.wiedu.controller.user;

import com.wiedu.dto.user.MyProfileResponse;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.user.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자 프로필 API 컨트롤러
 */
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 내 프로필 조회
     * GET /api/users/me
     */
    @GetMapping
    public ResponseEntity<MyProfileResponse> getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getMyProfile(userId));
    }
}
