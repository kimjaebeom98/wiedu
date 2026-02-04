package com.wiedu.service;

import com.wiedu.domain.entity.User;
import com.wiedu.domain.enums.UserStatus;
import com.wiedu.dto.request.LoginRequest;
import com.wiedu.dto.response.TokenResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.UserRepository;
import com.wiedu.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

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

        log.info("User logged in: {}", user.getEmail());

        return TokenResponse.of(accessToken, refreshToken, jwtProvider.getAccessTokenValidity());
    }

    public TokenResponse refresh(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
        }

        if (!jwtProvider.isRefreshToken(refreshToken)) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
        }

        Long userId = jwtProvider.getUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.AUTH_USER_DISABLED);
        }

        String newAccessToken = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getNickname());

        return TokenResponse.ofAccessToken(newAccessToken, jwtProvider.getAccessTokenValidity());
    }
}
