package com.wiedu.oauth.session;

import com.wiedu.dto.auth.TokenResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OAuth 세션 관리 서비스
 * 폴링 기반 OAuth 플로우를 위한 임시 토큰 저장소
 */
@Slf4j
@Service
public class OAuthSessionService {

    // sessionId -> TokenResponse (5분 후 자동 만료)
    private final Map<String, SessionData> sessions = new ConcurrentHashMap<>();

    private static final long SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5분

    public record SessionData(TokenResponse tokens, long createdAt) {}

    /**
     * OAuth 세션에 토큰 저장
     */
    public void storeTokens(String sessionId, TokenResponse tokens) {
        log.info("Storing tokens for session: {}", sessionId);
        sessions.put(sessionId, new SessionData(tokens, System.currentTimeMillis()));
        cleanupExpiredSessions();
    }

    /**
     * OAuth 세션에서 토큰 조회 및 삭제
     */
    public TokenResponse retrieveTokens(String sessionId) {
        SessionData data = sessions.remove(sessionId);
        if (data == null) {
            log.debug("No tokens found for session: {}", sessionId);
            return null;
        }

        // 만료된 세션 체크
        if (System.currentTimeMillis() - data.createdAt() > SESSION_EXPIRY_MS) {
            log.warn("Session expired: {}", sessionId);
            return null;
        }

        log.info("Retrieved tokens for session: {}", sessionId);
        return data.tokens();
    }

    /**
     * 만료된 세션 정리
     */
    private void cleanupExpiredSessions() {
        long now = System.currentTimeMillis();
        sessions.entrySet().removeIf(entry ->
            now - entry.getValue().createdAt() > SESSION_EXPIRY_MS
        );
    }
}
