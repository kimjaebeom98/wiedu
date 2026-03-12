package com.wiedu.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "EMAIL_VERIFICATION_CODES")
@Comment("이메일 인증 코드")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailVerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(nullable = false, length = 100)
    @Comment("이메일 주소")
    private String email;

    @Column(nullable = false, length = 6)
    @Comment("인증 코드 (6자리)")
    private String code;

    @Column(nullable = false)
    @Comment("만료 시간")
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    @Comment("인증 완료 여부")
    private boolean verified = false;

    @Builder
    public EmailVerificationCode(String email, String code, int expirationMinutes) {
        this.email = email;
        this.code = code;
        this.expiresAt = LocalDateTime.now().plusMinutes(expirationMinutes);
        this.verified = false;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid(String inputCode) {
        return !isExpired() && !verified && this.code.equals(inputCode);
    }

    public void markAsVerified() {
        this.verified = true;
    }
}
