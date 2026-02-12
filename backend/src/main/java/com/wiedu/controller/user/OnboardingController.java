package com.wiedu.controller.user;

import com.wiedu.dto.onboarding.*;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.user.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 온보딩 API 컨트롤러
 */
@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    /**
     * 온보딩 상태 조회
     * GET /api/onboarding/status
     */
    @GetMapping("/status")
    public ResponseEntity<OnboardingStatusResponse> getOnboardingStatus() {
        Long userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.getOnboardingStatus(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 1: 약관 동의
     * POST /api/onboarding/terms
     */
    @PostMapping("/terms")
    public ResponseEntity<Void> agreeToTerms(@Valid @RequestBody TermsAgreementRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.agreeToTerms(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 2: 프로필 설정
     * POST /api/onboarding/profile
     */
    @PostMapping("/profile")
    public ResponseEntity<Void> setupProfile(@Valid @RequestBody ProfileSetupRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.setupProfile(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 3: 관심분야 설정
     * POST /api/onboarding/interests
     */
    @PostMapping("/interests")
    public ResponseEntity<Void> setInterests(@RequestBody InterestsRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.setInterests(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 4: 경험 수준 설정
     * POST /api/onboarding/experience
     */
    @PostMapping("/experience")
    public ResponseEntity<Void> setExperienceLevel(@RequestBody ExperienceLevelRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.setExperienceLevel(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 5: 스터디 방식 선호 설정
     * POST /api/onboarding/study-preferences
     */
    @PostMapping("/study-preferences")
    public ResponseEntity<Void> setStudyPreferences(@RequestBody StudyPreferencesRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.setStudyPreferences(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 6: 지역 설정
     * POST /api/onboarding/region
     */
    @PostMapping("/region")
    public ResponseEntity<Void> setRegion(@RequestBody RegionRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.setRegion(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 7: 알림 설정
     * POST /api/onboarding/notifications
     */
    @PostMapping("/notifications")
    public ResponseEntity<Void> setNotificationSettings(@RequestBody NotificationSettingsRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.setNotificationSettings(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * Step 8: 온보딩 완료
     * POST /api/onboarding/complete
     */
    @PostMapping("/complete")
    public ResponseEntity<Void> completeOnboarding() {
        Long userId = SecurityUtils.getCurrentUserId();
        onboardingService.completeOnboarding(userId);
        return ResponseEntity.ok().build();
    }
}
