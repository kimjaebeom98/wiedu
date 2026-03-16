package com.wiedu.domain.entity;

import com.wiedu.domain.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.time.LocalDateTime;

@Entity
@Table(name = "WITHDRAWAL_REQUESTS", indexes = {
    @Index(name = "idx_withdrawal_study_user", columnList = "study_id, user_id"),
    @Index(name = "idx_withdrawal_status", columnList = "status")
})
@Comment("스터디 탈퇴 신청 정보")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WithdrawalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("탈퇴 신청 고유 ID")
    private Long id;

    @Column(nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @Comment("스터디 ID")
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @Comment("신청자 ID")
    private User user;

    @Column(length = 500)
    @Comment("탈퇴 사유")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Comment("상태: PENDING, APPROVED (거절 불가)")
    private RequestStatus status = RequestStatus.PENDING;

    @Comment("처리일시")
    private LocalDateTime processedAt;

    @Builder
    public WithdrawalRequest(Study study, User user, String reason) {
        this.study = study;
        this.user = user;
        this.reason = reason;
    }

    // 비즈니스 메서드
    public void approve() {
        this.status = RequestStatus.APPROVED;
        this.processedAt = LocalDateTime.now();
    }

    public boolean isPending() {
        return this.status == RequestStatus.PENDING;
    }

    public boolean isApproved() {
        return this.status == RequestStatus.APPROVED;
    }
}
