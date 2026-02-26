package com.wiedu.service.auth;

import com.wiedu.domain.entity.RefreshToken;
import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.UserStatus;
import com.wiedu.dto.auth.LoginRequest;
import com.wiedu.dto.auth.TokenResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.auth.RefreshTokenRepository;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    private static final int MAX_REFRESH_TOKENS_PER_USER = 5;

    @Transactional
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.AUTH_USER_DISABLED);
        }

        user.updateLastLogin();

        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getNickname());
        String refreshToken = jwtProvider.createRefreshToken(user.getId(), user.getEmail());

        // Refresh Token을 DB에 저장
        saveRefreshToken(user, refreshToken);

        log.info("User logged in: {}", user.getEmail());

        return TokenResponse.of(accessToken, refreshToken, jwtProvider.getAccessTokenValidity(), user.isOnboardingCompleted());
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
        }

        if (!jwtProvider.isRefreshToken(refreshToken)) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
        }

        // DB에서 토큰 검증 (서버사이드 검증)
        RefreshToken storedToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_TOKEN_INVALID));

        if (!storedToken.isValid()) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_EXPIRED);
        }

        User user = storedToken.getUser();

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.AUTH_USER_DISABLED);
        }

        String newAccessToken = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getNickname());

        return TokenResponse.ofAccessToken(newAccessToken, jwtProvider.getAccessTokenValidity());
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(RefreshToken::revoke);
        log.info("User logged out, token revoked");
    }

    @Transactional
    public void logoutAll(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        refreshTokenRepository.revokeAllByUser(user, LocalDateTime.now());
        log.info("All tokens revoked for user: {}", userId);
    }

    private void saveRefreshToken(User user, String token) {
        // 사용자당 최대 토큰 수 제한 (오래된 토큰 자동 폐기)
        if (refreshTokenRepository.countByUserAndRevokedFalse(user) >= MAX_REFRESH_TOKENS_PER_USER) {
            refreshTokenRepository.revokeAllByUser(user, LocalDateTime.now());
        }

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(14)) // 14일 유효
                .build();
        refreshTokenRepository.save(refreshToken);
    }
}
