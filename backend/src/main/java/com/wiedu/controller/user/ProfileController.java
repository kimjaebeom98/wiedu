package com.wiedu.controller.user;

import com.wiedu.dto.user.CategoryTemperatureResponse;
import com.wiedu.dto.user.MyProfileResponse;
import com.wiedu.dto.user.ProfileUpdateRequest;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.user.CategoryTemperatureService;
import com.wiedu.service.user.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 사용자 프로필 API 컨트롤러
 */
@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final CategoryTemperatureService categoryTemperatureService;

    /**
     * 내 프로필 조회
     * GET /api/users/me
     */
    @GetMapping("/api/users/me")
    public ResponseEntity<MyProfileResponse> getMyProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(profileService.getMyProfile(userId));
    }

    /**
     * 내 프로필 수정
     * PUT /api/users/me
     */
    @PutMapping("/api/users/me")
    public ResponseEntity<Void> updateMyProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        profileService.updateProfile(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 프로필 이미지 업로드
     * POST /api/users/me/image
     */
    @PostMapping("/api/users/me/image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(@RequestParam("file") MultipartFile file) throws IOException {
        Long userId = SecurityUtils.getCurrentUserId();
        String imageUrl = profileService.updateProfileImage(userId, file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    /**
     * 내 분야별 온도 조회
     * GET /api/users/me/category-temperatures
     */
    @GetMapping("/api/users/me/category-temperatures")
    public ResponseEntity<List<CategoryTemperatureResponse>> getMyCategoryTemperatures() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(categoryTemperatureService.getCategoryTemperatures(userId));
    }

    /**
     * 특정 유저의 분야별 온도 조회 (스터디장 프로필용)
     * GET /api/users/{userId}/category-temperatures
     */
    @GetMapping("/api/users/{userId}/category-temperatures")
    public ResponseEntity<List<CategoryTemperatureResponse>> getUserCategoryTemperatures(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryTemperatureService.getCategoryTemperatures(userId));
    }
}
