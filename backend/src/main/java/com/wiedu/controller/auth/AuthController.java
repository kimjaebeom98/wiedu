package com.wiedu.controller.auth;

import com.wiedu.dto.auth.LoginRequest;
import com.wiedu.dto.auth.TokenRefreshRequest;
import com.wiedu.dto.auth.TokenResponse;
import com.wiedu.security.jwt.JwtProvider;
import com.wiedu.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtProvider jwtProvider;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody TokenRefreshRequest request) {
        TokenResponse response = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody TokenRefreshRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(@RequestHeader("Authorization") String authorization) {
        String token = authorization.replace("Bearer ", "");
        Long userId = jwtProvider.getUserId(token);
        authService.logoutAll(userId);
        return ResponseEntity.ok().build();
    }
}
