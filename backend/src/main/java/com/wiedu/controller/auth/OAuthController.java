package com.wiedu.controller.auth;

import com.wiedu.dto.oauth.KakaoLoginRequest;
import com.wiedu.dto.auth.TokenResponse;
import com.wiedu.oauth.callback.OAuthCallbackRenderer;
import com.wiedu.oauth.kakao.KakaoOAuthService;
import com.wiedu.oauth.session.OAuthSessionService;
import com.wiedu.oauth.util.OAuthStateParser;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class OAuthController {

    private final KakaoOAuthService kakaoOAuthService;
    private final OAuthSessionService oAuthSessionService;
    private final OAuthCallbackRenderer callbackRenderer;
    private final OAuthStateParser stateParser;

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
        String sessionId = stateParser.extractSessionId(state);
        String appRedirectUri = stateParser.extractAppRedirectUri(state);
        log.info("Session ID: {}, App redirect URI: {}", sessionId, appRedirectUri);

        if (error != null) {
            // 에러 발생 시 에러 페이지 표시
            callbackRenderer.sendResultPage(response, false, "로그인 실패: " + error);
            return;
        }

        if (code == null) {
            callbackRenderer.sendResultPage(response, false, "인가 코드가 없습니다.");
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
                    "&expiresIn=" + tokenResponse.expiresIn() +
                    "&onboardingCompleted=" + tokenResponse.onboardingCompleted();

            callbackRenderer.sendSuccessPageWithDeepLink(response, redirectUrl);

        } catch (Exception e) {
            log.error("Kakao login failed: {}", e.getMessage());
            callbackRenderer.sendResultPage(response, false, "로그인 실패: " + e.getMessage());
        }
    }
}
