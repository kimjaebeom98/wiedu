package com.wiedu.oauth.kakao;

import com.wiedu.domain.entity.User;
import com.wiedu.dto.oauth.KakaoTokenResponse;
import com.wiedu.dto.oauth.KakaoUserResponse;
import com.wiedu.dto.auth.TokenResponse;
import com.wiedu.exception.BusinessException;
import com.wiedu.exception.ErrorCode;
import com.wiedu.repository.user.UserRepository;
import com.wiedu.security.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";
    private static final String OAUTH_PROVIDER = "KAKAO";

    private final KakaoProperties kakaoProperties;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final WebClient webClient = WebClient.builder().build();

    /**
     * 카카오 로그인 처리
     * 1. 인가 코드로 액세스 토큰 발급
     * 2. 액세스 토큰으로 사용자 정보 조회
     * 3. 사용자 생성 또는 조회
     * 4. JWT 토큰 발급
     */
    @Transactional
    public TokenResponse login(String code, String redirectUri) {
        // 1. 카카오 액세스 토큰 발급
        KakaoTokenResponse kakaoToken = getKakaoToken(code, redirectUri);
        log.debug("Kakao token received: {}", kakaoToken.tokenType());

        // 2. 카카오 사용자 정보 조회
        KakaoUserResponse kakaoUser = getKakaoUserInfo(kakaoToken.accessToken());
        log.debug("Kakao user info: id={}, email={}", kakaoUser.id(), kakaoUser.getEmail());

        // 3. 사용자 조회 또는 생성
        User user = findOrCreateUser(kakaoUser);
        user.updateLastLogin();

        // 4. JWT 토큰 발급
        String accessToken = jwtProvider.createAccessToken(user.getId(), user.getEmail(), user.getNickname());
        String refreshToken = jwtProvider.createRefreshToken(user.getId(), user.getEmail());

        log.info("Kakao login successful: userId={}, email={}", user.getId(), user.getEmail());

        return TokenResponse.of(accessToken, refreshToken, jwtProvider.getAccessTokenValidity(), user.isOnboardingCompleted());
    }

    /**
     * 서버 리다이렉트 URI를 사용한 카카오 로그인
     * 카카오 콜백 엔드포인트에서 사용
     */
    @Transactional
    public TokenResponse loginWithServerRedirect(String code) {
        return login(code, kakaoProperties.getRedirectUri());
    }

    /**
     * 인가 코드로 카카오 액세스 토큰 발급
     */
    private KakaoTokenResponse getKakaoToken(String code, String redirectUri) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("client_id", kakaoProperties.getClientId());
        formData.add("redirect_uri", redirectUri != null ? redirectUri : kakaoProperties.getRedirectUri());
        formData.add("code", code);

        try {
            KakaoTokenResponse response = webClient.post()
                    .uri(KAKAO_TOKEN_URL)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(KakaoTokenResponse.class)
                    .block();

            if (response == null || response.accessToken() == null) {
                throw new BusinessException(ErrorCode.OAUTH_TOKEN_FAILED);
            }

            return response;
        } catch (Exception e) {
            log.error("Failed to get Kakao token: {}", e.getMessage());
            throw new BusinessException(ErrorCode.OAUTH_TOKEN_FAILED);
        }
    }

    /**
     * 카카오 액세스 토큰으로 사용자 정보 조회
     */
    private KakaoUserResponse getKakaoUserInfo(String accessToken) {
        try {
            KakaoUserResponse response = webClient.get()
                    .uri(KAKAO_USER_INFO_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(KakaoUserResponse.class)
                    .block();

            if (response == null || response.id() == null) {
                throw new BusinessException(ErrorCode.OAUTH_USER_INFO_FAILED);
            }

            return response;
        } catch (Exception e) {
            log.error("Failed to get Kakao user info: {}", e.getMessage());
            throw new BusinessException(ErrorCode.OAUTH_USER_INFO_FAILED);
        }
    }

    /**
     * 카카오 사용자 정보로 회원 조회 또는 생성
     */
    private User findOrCreateUser(KakaoUserResponse kakaoUser) {
        String kakaoId = String.valueOf(kakaoUser.id());

        // 기존 OAuth 사용자 조회
        return userRepository.findByOauthProviderAndOauthProviderId(OAUTH_PROVIDER, kakaoId)
                .orElseGet(() -> createNewUser(kakaoUser, kakaoId));
    }

    /**
     * 새 사용자 생성
     */
    private User createNewUser(KakaoUserResponse kakaoUser, String kakaoId) {
        String email = kakaoUser.getEmail();
        String nickname = kakaoUser.getNickname();
        String profileImage = kakaoUser.getProfileImage();

        // 이메일이 없으면 임시 이메일 생성
        if (email == null || email.isBlank()) {
            email = "kakao_" + kakaoId + "@wiedu.app";
        }

        // 닉네임이 없거나 중복이면 랜덤 생성
        if (nickname == null || nickname.isBlank() || userRepository.existsByNickname(nickname)) {
            nickname = "위듀" + UUID.randomUUID().toString().substring(0, 8);
        }

        // 이메일 중복 체크 - 이미 다른 방식으로 가입된 경우
        if (userRepository.existsByEmail(email)) {
            log.warn("Email already exists with different provider: {}", email);
            // 이미 존재하는 이메일이면 카카오 ID로 이메일 생성
            email = "kakao_" + kakaoId + "@wiedu.app";
        }

        User newUser = User.createOAuthUser(email, nickname, profileImage, OAUTH_PROVIDER, kakaoId);
        newUser.verifyEmail(); // OAuth 사용자는 이메일 인증 완료 처리

        return userRepository.save(newUser);
    }
}
