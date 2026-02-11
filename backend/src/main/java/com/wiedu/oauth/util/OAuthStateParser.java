package com.wiedu.oauth.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * OAuth state 파라미터 파싱 유틸리티
 * Base64 인코딩된 JSON state에서 세션 ID, 리다이렉트 URI 등을 추출
 */
@Slf4j
@Component
public class OAuthStateParser {

    private static final String DEFAULT_APP_SCHEME = "wiedu://";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * state 파라미터에서 세션 ID 추출
     */
    public String extractSessionId(String state) {
        if (state == null || state.isEmpty()) {
            return null;
        }

        try {
            String decoded = new String(Base64.getUrlDecoder().decode(state), StandardCharsets.UTF_8);
            JsonNode node = objectMapper.readTree(decoded);
            JsonNode sessionIdNode = node.get("sessionId");
            if (sessionIdNode != null) {
                return sessionIdNode.asText();
            }
        } catch (Exception e) {
            log.warn("Failed to extract sessionId: {}", e.getMessage());
        }

        return null;
    }

    /**
     * state 파라미터에서 앱 리다이렉트 URI 추출
     * state는 URL-safe Base64로 인코딩된 JSON: {"appRedirectUri": "exp://..."}
     */
    public String extractAppRedirectUri(String state) {
        if (state == null || state.isEmpty()) {
            return DEFAULT_APP_SCHEME + "oauth/kakao";
        }

        try {
            // URL-safe Base64 디코딩 사용
            String decoded = new String(Base64.getUrlDecoder().decode(state), StandardCharsets.UTF_8);
            log.info("Decoded state: {}", decoded);
            JsonNode node = objectMapper.readTree(decoded);
            String appRedirectUri = node.get("appRedirectUri").asText();
            if (appRedirectUri != null && !appRedirectUri.isEmpty()) {
                return appRedirectUri;
            }
        } catch (Exception e) {
            log.warn("Failed to parse state parameter: {}", e.getMessage());
        }

        return DEFAULT_APP_SCHEME + "oauth/kakao";
    }
}
