package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "REFRESH_TOKENS", indexes = {
    @Index(name = "idx_refresh_token", columnList = "token"),
    @Index(name = "idx_refresh_token_user", columnList = "user_id")
})
@Comment("리프레시 토큰 저장소")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("토큰 소유 사용자")
    private User user;

    @Column(nullable = false, unique = true, length = 500)
    @Comment("리프레시 토큰 값")
    private String token;

    @Column(nullable = false)
    @Comment("토큰 만료 시간")
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    @Comment("토큰 발급 시간")
    private LocalDateTime issuedAt;

    @Comment("토큰 폐기 여부")
    private boolean revoked = false;

    @Comment("토큰 폐기 시간")
    private LocalDateTime revokedAt;

    @Column(length = 100)
    @Comment("디바이스 정보 (선택)")
    private String deviceInfo;

    @Builder
    public RefreshToken(User user, String token, LocalDateTime expiresAt, String deviceInfo) {
        this.user = user;
        this.token = token;
        this.expiresAt = expiresAt;
        this.issuedAt = LocalDateTime.now();
        this.deviceInfo = deviceInfo;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }

    public void revoke() {
        this.revoked = true;
        this.revokedAt = LocalDateTime.now();
    }
}
