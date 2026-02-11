package com.wiedu.controller.user;

import com.wiedu.dto.user.SignUpRequest;
import com.wiedu.dto.user.UserUpdateRequest;
import com.wiedu.dto.user.UserResponse;
import com.wiedu.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 사용자 API 컨트롤러
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

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
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
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
}
