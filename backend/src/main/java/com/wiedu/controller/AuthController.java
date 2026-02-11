package com.wiedu.controller;

import com.wiedu.dto.request.KakaoLoginRequest;
import com.wiedu.dto.request.LoginRequest;
import com.wiedu.dto.request.TokenRefreshRequest;
import com.wiedu.dto.response.TokenResponse;
import com.wiedu.service.AuthService;
import com.wiedu.service.KakaoOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String APP_SCHEME = "wiedu://";

    private final AuthService authService;
    private final KakaoOAuthService kakaoOAuthService;
    private final com.wiedu.service.OAuthSessionService oAuthSessionService;

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

    /**
     * 카카오 로그인
     * 프론트엔드에서 받은 인가 코드로 로그인 처리
     */
    @PostMapping("/kakao")
    public ResponseEntity<TokenResponse> kakaoLogin(@Valid @RequestBody KakaoLoginRequest request) {
        TokenResponse response = kakaoOAuthService.login(request.code(), request.redirectUri());
        return ResponseEntity.ok(response);
    }

    /**
     * OAuth 세션 토큰 폴링
     * 프론트엔드에서 세션 ID로 토큰을 조회
     */
    @GetMapping("/kakao/poll/{sessionId}")
    public ResponseEntity<?> pollKakaoSession(@PathVariable String sessionId) {
        log.debug("Polling for session: {}", sessionId);
        TokenResponse tokens = oAuthSessionService.retrieveTokens(sessionId);
        if (tokens == null) {
            return ResponseEntity.status(202).body(java.util.Map.of("status", "pending"));
        }
        return ResponseEntity.ok(tokens);
    }

    /**
     * 카카오 OAuth 콜백
     * 카카오에서 리다이렉트되어 오는 엔드포인트
     * 인가 코드를 받아서 로그인 처리 후 성공 페이지 표시 (폴링 방식)
     */
    @GetMapping("/kakao/callback")
    public void kakaoCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String error,
            @RequestParam(required = false, name = "error_description") String errorDescription,
            @RequestParam(required = false) String state,
            HttpServletResponse response) throws IOException {

        log.info("Kakao callback received: code={}, error={}, state={}",
                code != null ? "present" : "null", error, state != null ? "present" : "null");

        // state에서 세션 ID와 앱 리다이렉트 URI 추출
        String sessionId = extractSessionId(state);
        String appRedirectUri = extractAppRedirectUri(state);
        log.info("Session ID: {}, App redirect URI: {}", sessionId, appRedirectUri);

        if (error != null) {
            // 에러 발생 시 에러 페이지 표시
            sendResultPage(response, false, "로그인 실패: " + error);
            return;
        }

        if (code == null) {
            sendResultPage(response, false, "인가 코드가 없습니다.");
            return;
        }

        try {
            // 백엔드 자체 redirect URI 사용 (카카오에 등록된 URI)
            TokenResponse tokenResponse = kakaoOAuthService.loginWithServerRedirect(code);

            // 세션에 토큰 저장 (폴링으로 조회 가능)
            if (sessionId != null && !sessionId.isEmpty()) {
                oAuthSessionService.storeTokens(sessionId, tokenResponse);
                log.info("Tokens stored for session: {}", sessionId);
            }

            // 성공 페이지 표시 + 딥링크 시도
            String redirectUrl = appRedirectUri +
                    "?accessToken=" + URLEncoder.encode(tokenResponse.accessToken(), "UTF-8") +
                    "&refreshToken=" + URLEncoder.encode(tokenResponse.refreshToken(), "UTF-8") +
                    "&expiresIn=" + tokenResponse.expiresIn();

            sendSuccessPageWithDeepLink(response, redirectUrl);

        } catch (Exception e) {
            log.error("Kakao login failed: {}", e.getMessage());
            sendResultPage(response, false, "로그인 실패: " + e.getMessage());
        }
    }

    /**
     * JavaScript를 사용한 딥링크 리다이렉트
     * HTTP 302는 커스텀 스킴(exp://)으로 리다이렉트할 수 없으므로 JavaScript 사용
     */
    private void sendDeepLinkRedirect(HttpServletResponse response, String deepLinkUrl) throws IOException {
        response.setContentType("text/html;charset=UTF-8");
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>wiedu 로그인</title>" +
            "<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#18181B;color:#fff;text-align:center;}" +
            ".container{padding:20px;}.btn{display:inline-block;padding:16px 32px;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:12px;font-size:16px;margin-top:20px;}</style>" +
            "</head><body><div class=\"container\">" +
            "<h2>로그인 완료!</h2>" +
            "<p>앱으로 이동 중...</p>" +
            "<a class=\"btn\" href=\"" + deepLinkUrl + "\">앱으로 이동하기</a>" +
            "</div>" +
            "<script>" +
            "setTimeout(function(){window.location.href='" + deepLinkUrl + "';},100);" +
            "</script></body></html>";
        response.getWriter().write(html);
    }

    /**
     * 성공 페이지 + 딥링크 리다이렉트
     */
    private void sendSuccessPageWithDeepLink(HttpServletResponse response, String deepLinkUrl) throws IOException {
        response.setContentType("text/html;charset=UTF-8");
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>wiedu 로그인</title>" +
            "<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#18181B;color:#fff;text-align:center;}" +
            ".container{padding:20px;}.success{color:#22c55e;font-size:48px;margin-bottom:16px;}" +
            ".btn{display:inline-block;padding:16px 32px;background:#8B5CF6;color:#fff;text-decoration:none;border-radius:12px;font-size:16px;margin-top:20px;}" +
            ".info{color:#9CA3AF;font-size:14px;margin-top:16px;}</style>" +
            "</head><body><div class=\"container\">" +
            "<div class=\"success\">✓</div>" +
            "<h2>로그인 완료!</h2>" +
            "<p>앱으로 돌아가주세요.</p>" +
            "<a class=\"btn\" href=\"" + deepLinkUrl + "\">앱으로 이동</a>" +
            "<p class=\"info\">자동으로 이동하지 않으면 버튼을 눌러주세요.</p>" +
            "</div>" +
            "<script>" +
            "setTimeout(function(){window.location.href='" + deepLinkUrl + "';},500);" +
            "</script></body></html>";
        response.getWriter().write(html);
    }

    /**
     * 결과 페이지 표시
     */
    private void sendResultPage(HttpServletResponse response, boolean success, String message) throws IOException {
        response.setContentType("text/html;charset=UTF-8");
        String icon = success ? "✓" : "✕";
        String iconColor = success ? "#22c55e" : "#ef4444";
        String title = success ? "로그인 완료!" : "로그인 실패";
        String html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>wiedu 로그인</title>" +
            "<style>body{font-family:-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#18181B;color:#fff;text-align:center;}" +
            ".container{padding:20px;}.icon{color:" + iconColor + ";font-size:48px;margin-bottom:16px;}" +
            ".info{color:#9CA3AF;font-size:14px;margin-top:16px;}</style>" +
            "</head><body><div class=\"container\">" +
            "<div class=\"icon\">" + icon + "</div>" +
            "<h2>" + title + "</h2>" +
            "<p>" + message + "</p>" +
            "<p class=\"info\">앱으로 돌아가 다시 시도해주세요.</p>" +
            "</div></body></html>";
        response.getWriter().write(html);
    }

    /**
     * state 파라미터에서 세션 ID 추출
     */
    private String extractSessionId(String state) {
        if (state == null || state.isEmpty()) {
            return null;
        }

        try {
            String decoded = new String(Base64.getUrlDecoder().decode(state), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(decoded);
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
    private String extractAppRedirectUri(String state) {
        if (state == null || state.isEmpty()) {
            return APP_SCHEME + "oauth/kakao";
        }

        try {
            // URL-safe Base64 디코딩 사용
            String decoded = new String(Base64.getUrlDecoder().decode(state), StandardCharsets.UTF_8);
            log.info("Decoded state: {}", decoded);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(decoded);
            String appRedirectUri = node.get("appRedirectUri").asText();
            if (appRedirectUri != null && !appRedirectUri.isEmpty()) {
                return appRedirectUri;
            }
        } catch (Exception e) {
            log.warn("Failed to parse state parameter: {}", e.getMessage());
        }

        return APP_SCHEME + "oauth/kakao";
    }
}
