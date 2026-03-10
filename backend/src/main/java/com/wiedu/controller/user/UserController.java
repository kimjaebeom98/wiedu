package com.wiedu.controller.user;

import com.wiedu.dto.user.NearbyMemberResponse;
import com.wiedu.dto.user.SignUpRequest;
import com.wiedu.dto.user.UserUpdateRequest;
import com.wiedu.dto.user.UserResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.security.SecurityUtils;
import com.wiedu.service.user.NearbyMemberService;
import com.wiedu.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 사용자 API 컨트롤러
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final NearbyMemberService nearbyMemberService;

    /**
     * 회원가입
     * POST /api/users/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        UserResponse response = userService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 사용자 조회 (ID)
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long userId) {
        UserResponse response = userService.findById(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 정보 수정
     * PATCH /api/users/{userId}
     * 본인만 수정 가능
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        // 본인 확인 - IDOR 방지
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!currentUserId.equals(userId)) {
            throw new BusinessException(ErrorCode.AUTH_ACCESS_DENIED);
        }

        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 이메일 중복 체크
     * GET /api/users/check-email?email=xxx
     */
    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmailDuplicated(@RequestParam String email) {
        boolean duplicated = userService.isEmailDuplicated(email);
        return ResponseEntity.ok(Map.of("duplicated", duplicated));
    }

    /**
     * 닉네임 중복 체크
     * GET /api/users/check-nickname?nickname=xxx
     */
    @GetMapping("/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNicknameDuplicated(@RequestParam String nickname) {
        boolean duplicated = userService.isNicknameDuplicated(nickname);
        return ResponseEntity.ok(Map.of("duplicated", duplicated));
    }

    /**
     * 근처 활동중인 멤버 조회
     * GET /api/users/nearby?latitude=37.5&longitude=127.0&radius=10&limit=10
     * - 활동중: 3일 이내 로그인
     * - 근처: 반경 내 (기본 10km)
     */
    @GetMapping("/nearby")
    public ResponseEntity<List<NearbyMemberResponse>> getNearbyActiveMembers(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false, defaultValue = "10") Double radius,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {

        Long currentUserId = SecurityUtils.getCurrentUserId();

        List<NearbyMemberResponse> members;
        if (latitude != null && longitude != null) {
            // 파라미터로 위치 전달된 경우
            members = nearbyMemberService.findNearbyActiveMembers(
                    currentUserId, latitude, longitude, radius, limit);
        } else {
            // 프로필 위치 기준
            members = nearbyMemberService.findNearbyActiveMembersForCurrentUser(currentUserId);
        }

        return ResponseEntity.ok(members);
    }
}
