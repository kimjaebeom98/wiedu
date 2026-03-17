package com.wiedu.domain.entity;

import com.wiedu.domain.enums.ExperienceLevel;
import com.wiedu.domain.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "USERS")
@Comment("사용자 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("사용자 고유 ID")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    @Comment("이메일 (로그인 ID)")
    private String email;

    @Column(nullable = false, length = 50)
    @Comment("이름 (실명, 중복 허용)")
    private String nickname;

    @Column(length = 500)
    @Comment("프로필 이미지 URL")
    private String profileImage;

    @Column(length = 200)
    @Comment("한줄 소개")
    private String bio;

    @Column(length = 255)
    @Comment("비밀번호 (암호화, 소셜 로그인 시 NULL)")
    private String password;

    @Column(length = 20)
    @Comment("OAuth 제공자: KAKAO, NAVER, GOOGLE")
    private String oauthProvider;

    @Column(length = 100)
    @Comment("OAuth 제공자의 사용자 ID")
    private String oauthProviderId;

    @Column(precision = 3, scale = 1)
    @Comment("매너 온도 (기본 36.5)")
    private BigDecimal temperature = BigDecimal.valueOf(36.5);

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("계정 상태: ACTIVE, INACTIVE, BANNED, WITHDRAWN")
    private UserStatus status = UserStatus.ACTIVE;

    @Column(nullable = false)
    @Comment("이메일 인증 여부")
    private boolean emailVerified = false;

    @Comment("마지막 로그인 일시")
    private LocalDateTime lastLoginAt;

    // === 약관 동의 ===
    @Comment("약관 동의 일시")
    private LocalDateTime termsAgreedAt;

    @Comment("마케팅 수신 동의 여부")
    private boolean marketingAgreed = false;

    // === 경험 수준 ===
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Comment("스터디 경험 수준: BEGINNER, INTERMEDIATE, EXPERIENCED")
    private ExperienceLevel experienceLevel;

    // === 지역 설정 ===
    @Column(length = 200)
    @Comment("활동 지역 (도로명 주소)")
    private String region;

    @Comment("활동 지역 위도")
    private Double latitude;

    @Comment("활동 지역 경도")
    private Double longitude;

    // === 알림 설정 ===
    @Comment("푸시 알림 활성화")
    private boolean pushNotificationEnabled = true;

    @Comment("채팅 알림 활성화")
    private boolean chatNotificationEnabled = true;

    @Comment("스터디 알림 활성화")
    private boolean studyNotificationEnabled = true;

    // === 온보딩 상태 ===
    @Comment("온보딩 완료 여부")
    private boolean onboardingCompleted = false;

    @Comment("온보딩 완료 일시")
    private LocalDateTime onboardingCompletedAt;

    @Builder
    public User(String email, String nickname, String password, String profileImage,
                String oauthProvider, String oauthProviderId) {
        this.email = email;
        this.nickname = nickname;
        this.password = password;
        this.profileImage = profileImage;
        this.oauthProvider = oauthProvider;
        this.oauthProviderId = oauthProviderId;
    }

    // OAuth 사용자 생성용 팩토리 메서드
    public static User createOAuthUser(String email, String nickname, String profileImage,
                                       String oauthProvider, String oauthProviderId) {
        return User.builder()
                .email(email)
                .nickname(nickname)
                .profileImage(profileImage)
                .oauthProvider(oauthProvider)
                .oauthProviderId(oauthProviderId)
                .build();
    }

    // 비즈니스 메서드
    public void updateProfile(String nickname, String profileImage) {
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public void verifyEmail() {
        this.emailVerified = true;
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }

    public void agreeToTerms(boolean marketingAgreed) {
        this.termsAgreedAt = LocalDateTime.now();
        this.marketingAgreed = marketingAgreed;
    }

    public void updateExperienceLevel(ExperienceLevel level) {
        this.experienceLevel = level;
    }

    public void updateRegion(String region) {
        this.region = region;
    }

    public void updateLocation(String region, Double latitude, Double longitude) {
        this.region = region;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void updateBio(String bio) {
        this.bio = bio;
    }

    public void updateProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public void updateNotificationSettings(boolean push, boolean chat, boolean study) {
        this.pushNotificationEnabled = push;
        this.chatNotificationEnabled = chat;
        this.studyNotificationEnabled = study;
    }

    public void completeOnboarding() {
        this.onboardingCompleted = true;
        this.onboardingCompletedAt = LocalDateTime.now();
    }

    public void withdraw() {
        this.status = UserStatus.WITHDRAWN;
    }

    /**
     * 회원 탈퇴 시 개인정보 익명화
     * - status를 WITHDRAWN으로 변경
     * - 이메일, 닉네임 등 개인정보 익명화
     * - 게시글/댓글 작성자는 유지 (화면에서 "탈퇴한 사용자"로 표시)
     */
    public void anonymize() {
        this.status = UserStatus.WITHDRAWN;
        this.email = "withdrawn_" + UUID.randomUUID() + "@deleted.local";
        this.nickname = "탈퇴한 사용자";
        this.profileImage = null;
        this.bio = null;
        this.password = null;
        this.oauthProvider = null;
        this.oauthProviderId = null;
        this.region = null;
        this.latitude = null;
        this.longitude = null;
        this.emailVerified = false;
        this.pushNotificationEnabled = false;
        this.chatNotificationEnabled = false;
        this.studyNotificationEnabled = false;
    }

    /**
     * 탈퇴한 사용자인지 확인
     */
    public boolean isWithdrawn() {
        return this.status == UserStatus.WITHDRAWN;
    }

    /**
     * 온도 업데이트 (리뷰 평점에 따라)
     * 온도 범위: 0 ~ 100
     */
    public void updateTemperature(BigDecimal delta) {
        BigDecimal newTemp = this.temperature.add(delta);
        // 최소 0, 최대 100으로 제한
        if (newTemp.compareTo(BigDecimal.ZERO) < 0) {
            this.temperature = BigDecimal.ZERO;
        } else if (newTemp.compareTo(BigDecimal.valueOf(100)) > 0) {
            this.temperature = BigDecimal.valueOf(100);
        } else {
            this.temperature = newTemp;
        }
    }
}
