package com.wiedu.domain.entity;

import com.wiedu.domain.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")
@Comment("사용자 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("사용자 고유 ID")
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    @Comment("이메일 (로그인 ID)")
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    @Comment("닉네임")
    private String nickname;

    @Column(length = 500)
    @Comment("프로필 이미지 URL")
    private String profileImage;

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

    @Column(nullable = false, updatable = false)
    @Comment("가입일시")
    private LocalDateTime createdAt;

    @Comment("정보 수정일시")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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
}
