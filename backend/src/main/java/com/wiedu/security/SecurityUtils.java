package com.wiedu.security;

import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Security 관련 유틸리티
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * 현재 인증된 사용자의 ID를 반환
     * @return userId
     * @throws BusinessException 인증되지 않은 경우
     */
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_MISSING);
        }

        // JwtAuthenticationFilter에서 설정한 userId (principal에 저장됨)
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }

        throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
    }

    /**
     * 현재 사용자가 인증되었는지 확인
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }
}
